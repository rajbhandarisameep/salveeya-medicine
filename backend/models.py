from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    batch_number = Column(String(100), unique=True, index=True)
    name = Column(String(255), index=True)
    category = Column(String(100))
    stock_quantity = Column(Integer, default=0)
    unit_price = Column(Float, default=0.0)
    supplier = Column(String(255))
    expiry_date = Column(Date)
    
    invoice_items = relationship("InvoiceItem", back_populates="product")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(100), unique=True, index=True)
    supplier = Column(String(255))
    date = Column(Date)
    total_amount = Column(Float, default=0.0)

    items = relationship("InvoiceItem", back_populates="invoice")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    cost_price = Column(Float)
    selling_price = Column(Float)

    invoice = relationship("Invoice", back_populates="items")
    product = relationship("Product", back_populates="invoice_items")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    total_amount = Column(Float, default=0.0)

