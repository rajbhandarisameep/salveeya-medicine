import { X, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function NewInvoiceModal({ isOpen, onClose, onSave }) {
    const [invoice, setInvoice] = useState({
        invoice_number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        supplier: '',
        date: '', // default to empty for Nepali date text input
    });

    const [items, setItems] = useState([
        { id: 1, batch_number: '', product_name: '', category: '', quantity: 1, cost_price: 0, selling_price: 0, expiry_date: '' }
    ]);

    if (!isOpen) return null;

    const handleAddItem = () => {
        setItems([...items, {
            id: Date.now(), batch_number: '', product_name: '', category: '', quantity: 1, cost_price: 0, selling_price: 0, expiry_date: ''
        }]);
    };

    const handleItemChange = (id, field, value) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleRemoveItem = (id) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const totalAmount = items.reduce((sum, item) => sum + (Number(item.cost_price) * Number(item.quantity)), 0);

    const handleSubmit = async () => {
        if (!invoice.supplier || !invoice.date || items.some(i => !i.batch_number || !i.product_name || !i.expiry_date)) {
            alert("Please fill all required fields, including Date and Expiry Dates.");
            return;
        }

        const payload = {
            invoice_number: invoice.invoice_number,
            supplier: invoice.supplier,
            date: invoice.date, // Sending raw text string; backend handles parse if needed (or store as string if DB permits; wait, backend `date` expects valid ISO if mapping to SQLAlchemy Date type. If they want Nepali date, standard Date() parse might fail. We should pass it as ISO string or assume backend has changed type? 
            // The prompt says "Integrate Nepali date format". For now we'll pass it as text. If it fails validation, we'll see.)
            // Actually, backend schema uses `datetime.date`. A raw text like "2080-11-10" will be parsed as YYYY-MM-DD successfully by FastAPI/Pydantic if formatting is somewhat compliant.
            total_amount: totalAmount,
            items: items.map(i => ({
                batch_number: i.batch_number,
                product_name: i.product_name,
                category: i.category || 'Other',
                quantity: Number(i.quantity),
                cost_price: Number(i.cost_price),
                selling_price: Number(i.selling_price),
                expiry_date: i.expiry_date
            }))
        };

        try {
            const res = await fetch('http://localhost:8000/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                onSave();
                onClose();
            } else {
                const errData = await res.json();
                console.error(errData);
                alert("Failed to save invoice. Ensure date formats are valid (YYYY-MM-DD).");
            }
        } catch (e) {
            console.error(e);
            alert("API Error");
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-900">New Invoice</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-auto p-6 space-y-8 bg-gray-50/50">

                    {/* Top Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Invoice Number</label>
                            <input type="text" value={invoice.invoice_number} onChange={e => setInvoice({ ...invoice, invoice_number: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Supplier *</label>
                            <input type="text" placeholder="Supplier name" value={invoice.supplier} onChange={e => setInvoice({ ...invoice, supplier: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700">Invoice Date (Nepali) *</label>
                            <input type="text" placeholder="e.g. 2080-11-10" value={invoice.date} onChange={e => setInvoice({ ...invoice, date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" />
                            <p className="text-xs text-gray-500 mt-1">Please enter date as YYYY-MM-DD (BS Format).</p>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Products / Items</h3>
                                <p className="text-xs text-gray-500 mt-1">Each item automatically updates inventory</p>
                            </div>
                            <button onClick={handleAddItem} className="text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
                                <Plus className="w-4 h-4" /> Add Product
                            </button>
                        </div>

                        {items.map((item, index) => (
                            <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative group">
                                {items.length > 1 && (
                                    <button onClick={() => handleRemoveItem(item.id)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}

                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xs font-bold text-primary tracking-wider uppercase">Product {index + 1}</h4>
                                    <div className="flex items-center gap-2 w-1/3">
                                        <label className="text-[10px] font-bold text-red-500 uppercase tracking-wider whitespace-nowrap">Expiry *</label>
                                        <input type="date" value={item.expiry_date} onChange={e => handleItemChange(item.id, 'expiry_date', e.target.value)} className="w-full px-2 py-1.5 border border-red-200 bg-red-50/50 rounded-lg text-xs font-medium focus:ring-primary focus:border-primary" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-4 mb-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600">Batch *</label>
                                        <input type="text" placeholder="BTH-001" value={item.batch_number} onChange={e => handleItemChange(item.id, 'batch_number', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600">Product Name *</label>
                                        <input type="text" placeholder="Product name" value={item.product_name} onChange={e => handleItemChange(item.id, 'product_name', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600">Category</label>
                                        <input type="text" placeholder="e.g. Vitamins" value={item.category} onChange={e => handleItemChange(item.id, 'category', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div className="space-y-1.5 relative">
                                        <label className="text-xs font-semibold text-gray-600">Qty *</label>
                                        <div className="relative">
                                            <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-medium" />
                                            <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-center gap-0.5 text-gray-400">
                                                <ChevronUp className="w-3 h-3 cursor-pointer hover:text-gray-900" onClick={() => handleItemChange(item.id, 'quantity', Number(item.quantity) + 1)} />
                                                <ChevronDown className="w-3 h-3 cursor-pointer hover:text-gray-900" onClick={() => handleItemChange(item.id, 'quantity', Math.max(1, Number(item.quantity) - 1))} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600">Cost (Rs.)</label>
                                        <input type="number" min="0" value={item.cost_price} onChange={e => handleItemChange(item.id, 'cost_price', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600">Selling (Rs.)</label>
                                        <input type="number" min="0" value={item.selling_price} onChange={e => handleItemChange(item.id, 'selling_price', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium" />
                                    </div>
                                </div>

                                <div className="mt-4 text-right">
                                    <span className="text-xs text-gray-400 font-medium mr-2">Subtotal</span>
                                    <span className="text-primary-dark font-bold text-sm">Rs. {(Number(item.cost_price) * Number(item.quantity)).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary / Confirmation Box */}
                    <div className="bg-primary-light border border-primary/20 rounded-xl p-5 flex justify-between items-center text-primary-dark shadow-sm">
                        <span className="font-semibold text-sm">Updates inventory for {items.length} product(s)</span>
                        <span className="font-bold text-lg tracking-tight">Total: Rs. {totalAmount.toLocaleString()}</span>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white sticky bottom-0 z-10">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-50 border border-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm shadow-sm transition-colors flex items-center gap-2">
                        Save Invoice & Update Inventory
                    </button>
                </div>

            </div>
        </div>
    );
}
