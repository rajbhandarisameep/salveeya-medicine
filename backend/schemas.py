from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

# --- Product Schemas ---
class ProductBase(BaseModel):
    batch_number: str
    name: str
    category: Optional[str] = None
    stock_quantity: int = 0
    unit_price: float = 0.0
    supplier: Optional[str] = None
    expiry_date: Optional[date] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True

# --- Invoice Item Schemas ---
class InvoiceItemCreate(BaseModel):
    """Schema for creating invoice items — includes product info for lookup/creation."""
    product_id: Optional[int] = None
    batch_number: str
    product_name: str
    category: Optional[str] = None
    quantity: int
    cost_price: float
    selling_price: float
    expiry_date: Optional[date] = None

class InvoiceItem(BaseModel):
    """Response schema — matches the InvoiceItem DB model columns."""
    id: int
    invoice_id: int
    product_id: Optional[int] = None
    quantity: int
    cost_price: float
    selling_price: float

    class Config:
        from_attributes = True

# --- Invoice Schemas ---
class InvoiceBase(BaseModel):
    invoice_number: str
    supplier: str
    date: date
    total_amount: float = 0.0

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]

class Invoice(InvoiceBase):
    id: int
    items: List[InvoiceItem] = []

    class Config:
        from_attributes = True

# --- Sale Schemas ---
class SaleBase(BaseModel):
    total_amount: float

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True

# --- Dashboard Schemas ---
class DashboardStats(BaseModel):
    todays_sales: float
    transactions_today: int
    total_products: int
    expired_items: int
    low_stock_items: int
    all_time_sales: float
    total_records: int
