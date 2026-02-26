"""
Salveeya Medicine — FastAPI Backend
Entry point for the API server.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import date, datetime, timedelta
import models, schemas
from database import engine, get_db

# Try to create DB tables — don't crash if the cloud DB is temporarily unreachable
try:
    models.Base.metadata.create_all(bind=engine)
    print("✅ Connected to database and created tables successfully.")
except Exception as e:
    print(f"⚠️  Could not connect to database on startup: {e}")
    print("   The server will start, but DB operations will fail until connectivity is restored.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Retry table creation on startup (in case first attempt failed)
    try:
        models.Base.metadata.create_all(bind=engine)
    except Exception:
        pass
    yield


app = FastAPI(
    title="Salveeya Medicine API",
    version="0.1.0",
    lifespan=lifespan,
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Salveeya Medicine API is running."}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


# --- Dashboard ---
@app.get("/api/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    today = date.today()
    
    # Today's sales (mock logic - assuming Sale table tracks daily total)
    todays_sales = db.query(func.sum(models.Sale.total_amount))\
                     .filter(func.date(models.Sale.date) == today)\
                     .scalar() or 0.0
                     
    transactions_today = db.query(models.Sale)\
                           .filter(func.date(models.Sale.date) == today)\
                           .count()
                           
    total_products = db.query(models.Product).count()
    
    expired_items = db.query(models.Product)\
                      .filter(models.Product.expiry_date < today)\
                      .count()
                      
    low_stock_items = db.query(models.Product)\
                        .filter(models.Product.stock_quantity <= 10)\
                        .count()
                        
    all_time_sales = db.query(func.sum(models.Sale.total_amount)).scalar() or 0.0
    total_records = db.query(models.Sale).count()
    
    return {
        "todays_sales": todays_sales,
        "transactions_today": transactions_today,
        "total_products": total_products,
        "expired_items": expired_items,
        "low_stock_items": low_stock_items,
        "all_time_sales": all_time_sales,
        "total_records": total_records
    }

# --- Products ---
@app.get("/api/products", response_model=list[schemas.Product])
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

@app.get("/api/products/expired", response_model=list[schemas.Product])
def get_expired_products(db: Session = Depends(get_db)):
    today = date.today()
    return db.query(models.Product).filter(models.Product.expiry_date < today).all()

@app.get("/api/products/out-of-stock", response_model=list[schemas.Product])
def get_out_of_stock_products(db: Session = Depends(get_db)):
    return db.query(models.Product).filter(models.Product.stock_quantity == 0).all()

# --- Invoices ---
@app.get("/api/invoices", response_model=list[schemas.Invoice])
def get_invoices(db: Session = Depends(get_db)):
    return db.query(models.Invoice).all()

@app.post("/api/invoices", response_model=schemas.Invoice)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    # Create the invoice
    db_invoice = models.Invoice(
        invoice_number=invoice.invoice_number,
        supplier=invoice.supplier,
        date=invoice.date,
        total_amount=invoice.total_amount
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    # Process items
    for item in invoice.items:
        # Check if product exists by batch or name
        db_product = db.query(models.Product).filter(
            models.Product.batch_number == item.batch_number
        ).first()
        
        if db_product:
            # Update stock, price and expiry date
            db_product.stock_quantity += item.quantity
            db_product.unit_price = item.selling_price
            if item.expiry_date:
                db_product.expiry_date = item.expiry_date
        else:
            # Create new product
            db_product = models.Product(
                batch_number=item.batch_number,
                name=item.product_name,
                category=item.category,
                stock_quantity=item.quantity,
                unit_price=item.selling_price,
                supplier=invoice.supplier,
                # Use provided expiry date or fallback to +1 year
                expiry_date=item.expiry_date or (date.today() + timedelta(days=365))
            )
            db.add(db_product)
            db.commit()
            db.refresh(db_product)
            
        # Create Invoice Item
        db_invoice_item = models.InvoiceItem(
            invoice_id=db_invoice.id,
            product_id=db_product.id,
            quantity=item.quantity,
            cost_price=item.cost_price,
            selling_price=item.selling_price
        )
        db.add(db_invoice_item)
    
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

# --- Seed DB Route (For testing UI) ---
@app.post("/api/seed")
def seed_database(db: Session = Depends(get_db)):
    if db.query(models.Product).count() > 0:
        return {"message": "Database already seeded"}

    products = [
        models.Product(batch_number="BTH-001", name="Paracetamol 500mg", category="Pain Relief", stock_quantity=500, unit_price=85, supplier="PharmaCorp Ltd", expiry_date=date(2025, 12, 15)),
        models.Product(batch_number="BTH-002", name="Vitamin C 1000mg", category="Vitamins", stock_quantity=350, unit_price=320, supplier="HealthPlus Inc", expiry_date=date(2026, 6, 20)),
        models.Product(batch_number="BTH-003", name="Amoxicillin 250mg", category="Antibiotics", stock_quantity=200, unit_price=480, supplier="MediSupply Co", expiry_date=date(2025, 9, 10)),
        models.Product(batch_number="BTH-004", name="Ibuprofen 400mg", category="Pain Relief", stock_quantity=180, unit_price=120, supplier="PharmaCorp Ltd", expiry_date=date(2026, 1, 25)),
        models.Product(batch_number="BTH-005", name="Cetirizine 10mg", category="Allergy", stock_quantity=420, unit_price=95, supplier="AllergyFree Labs", expiry_date=date(2026, 3, 30)),
        models.Product(batch_number="BTH-006", name="Omeprazole 20mg", category="Digestive", stock_quantity=44, unit_price=210, supplier="GastroMed Pharma", expiry_date=date(2025, 11, 18)),
        models.Product(batch_number="BTH-007", name="Metformin 500mg", category="Diabetes", stock_quantity=0, unit_price=150, supplier="DiabCare Medical", expiry_date=date(2025, 8, 5)), # Out of stock
        models.Product(batch_number="BTH-008", name="Aspirin 100mg", category="Pain Relief", stock_quantity=600, unit_price=60, supplier="PharmaCorp Ltd", expiry_date=date(2026, 4, 12)),
        models.Product(batch_number="BTH-009", name="Cough Syrup 100ml", category="Other", stock_quantity=120, unit_price=185, supplier="HealthPlus Inc", expiry_date=date(2025, 1, 5)), # Expired
        models.Product(batch_number="BTH-010", name="Eye Drops 10ml", category="Other", stock_quantity=85, unit_price=140, supplier="VisionCare Labs", expiry_date=date(2026, 9, 15))
    ]
    try:
        db.add_all(products)
        invoices = [
            models.Invoice(invoice_number="INV-2024-001", supplier="PharmaCorp Ltd", date=date(2024, 1, 15), total_amount=42500),
            models.Invoice(invoice_number="INV-2024-002", supplier="HealthPlus Inc", date=date(2024, 1, 18), total_amount=112000),
            models.Invoice(invoice_number="INV-2024-003", supplier="MediSupply Co", date=date(2024, 1, 20), total_amount=96000)
        ]
        db.add_all(invoices)
        db.commit()
        return {"message": "Seeded database successfully"}
    except Exception as e:
        db.rollback()
        return {"message": f"Seed failed or already partially seeded: {str(e)}"}
