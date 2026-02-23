'use client';
import React, { useState, useEffect } from 'react';
import { Search, FileText, Plus, MoreVertical, ChevronDown, ChevronRight, PackageOpen } from 'lucide-react';
import NewInvoiceModal from '@/components/NewInvoiceModal';

export default function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);

    const fetchInvoices = () => {
        fetch('http://localhost:8000/api/invoices')
            .then(res => res.json())
            .then(data => {
                setInvoices(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch invoices:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const toggleExpand = (id) => {
        setExpandedInvoiceId(expandedInvoiceId === id ? null : id);
    };

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);

    const filteredInvoices = invoices.filter(inv =>
        inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        inv.supplier.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)]">

            {/* Header Area */}
            <div className="p-6 border-b border-gray-100 bg-white z-10 sticky top-0">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Wholesale Invoices</h1>
                        <p className="text-gray-500 text-sm mt-1">Add products to inventory via new invoices</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all hover:shadow-md">
                        <Plus className="w-4 h-4" strokeWidth={3} /> New Invoice
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="border border-gray-100 rounded-xl p-5 shadow-sm bg-white">
                        <h3 className="text-xs font-semibold text-gray-400 mb-2">Total Invoices</h3>
                        <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                    </div>
                    <div className="border border-gray-100 rounded-xl p-5 shadow-sm bg-white">
                        <h3 className="text-xs font-semibold text-gray-400 mb-2">Total Amount</h3>
                        <p className="text-2xl font-bold text-gray-900">Rs. {totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="border border-gray-100 rounded-xl p-5 shadow-sm bg-white">
                        <h3 className="text-xs font-semibold text-gray-400 mb-2">Total Products</h3>
                        <p className="text-2xl font-bold text-gray-900">{invoices.reduce((acc, inv) => acc + inv.items?.length || 0, 0)}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium bg-gray-50/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto bg-white">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 bg-gray-50 shadow-sm z-10 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 w-12 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest"></th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoice</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supplier</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Items</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                            <th className="px-6 py-4 text-right w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-500 font-medium">Loading invoices...</td></tr>
                        ) : filteredInvoices.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-500 font-medium">No invoices found.</td></tr>
                        ) : (
                            filteredInvoices.map((inv) => (
                                <React.Fragment key={inv.id}>
                                    <tr
                                        onClick={() => toggleExpand(inv.id)}
                                        className={`hover:bg-gray-50/80 transition-colors cursor-pointer group ${expandedInvoiceId === inv.id ? 'bg-primary/5' : ''}`}
                                    >
                                        <td className="px-6 py-5 text-center">
                                            <button className="text-gray-400 group-hover:text-primary transition-colors">
                                                {expandedInvoiceId === inv.id ? <ChevronDown className="w-5 h-5 mx-auto" /> : <ChevronRight className="w-5 h-5 mx-auto" />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-gray-900">{inv.invoice_number}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <span className="font-semibold text-gray-700">{inv.supplier}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-medium text-gray-600">{inv.date}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">
                                                {inv.items ? inv.items.length : 0} items
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-gray-900">
                                            Rs. {inv.total_amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {/* This button serves as the "3-dots menu". You can add dropdowns later. Since the row expands, we can just trigger expansion. */}
                                            <button onClick={(e) => { e.stopPropagation(); toggleExpand(inv.id); }} className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Expanded Product List View */}
                                    {expandedInvoiceId === inv.id && (
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <td colSpan="7" className="p-0">
                                                <div className="p-6 border-l-4 border-primary ml-6 my-4 bg-white rounded-lg shadow-sm">
                                                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                        <PackageOpen className="w-4 h-4 text-primary" /> Products Received in {inv.invoice_number}
                                                    </h4>

                                                    {(!inv.items || inv.items.length === 0) ? (
                                                        <p className="text-sm text-gray-500">No products detailed for this invoice.</p>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {inv.items.map((item, idx) => (
                                                                <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50 hover:bg-white transition-colors">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <h5 className="font-bold text-sm text-gray-900">{item.product?.name || `Product ID ${item.product_id}`}</h5>
                                                                        <span className="text-xs font-medium text-gray-500">x{item.quantity}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-end mt-3 text-sm">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Cost</span>
                                                                            <span className="font-semibold text-gray-700">Rs. {item.cost_price}</span>
                                                                        </div>
                                                                        <div className="flex flex-col text-right">
                                                                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Subtotal</span>
                                                                            <span className="font-bold text-primary-dark">Rs. {(item.cost_price * item.quantity).toLocaleString()}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <NewInvoiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchInvoices}
            />
        </div>
    );
}
