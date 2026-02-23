'use client';
import { useState, useEffect } from 'react';
import { Search, ChevronDown, Hexagon, MoreVertical, Plus } from 'lucide-react';
import Link from 'next/link';

export default function Inventory() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('http://localhost:8000/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch products:", err);
                setLoading(false);
            });
    }, []);

    const getStockBadge = (stock) => {
        if (stock > 50) return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-semibold">In Stock</span>;
        if (stock > 0) return <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-md text-xs font-semibold">Low Stock</span>;
        return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-xs font-semibold">Out of Stock</span>;
    };

    const getCategoryBadgeColor = (category) => {
        const colors = {
            'Pain Relief': 'text-emerald-700 bg-emerald-50',
            'Vitamins': 'text-blue-700 bg-blue-50',
            'Antibiotics': 'text-red-700 bg-red-50',
            'Allergy': 'text-purple-700 bg-purple-50',
            'Digestive': 'text-orange-700 bg-orange-50',
            'Diabetes': 'text-indigo-700 bg-indigo-50',
            'Other': 'text-gray-700 bg-gray-50'
        };
        return colors[category] || 'text-gray-700 bg-gray-50';
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.batch_number.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)]">

            {/* Header Area */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                        <p className="text-gray-500 text-sm mt-1">{products.length} products in stock</p>
                    </div>
                </div>

                <div className="bg-primary-light text-primary-dark text-xs font-medium px-4 py-2 rounded-lg inline-flex items-center gap-2 mb-4">
                    <Plus className="w-3 h-3" /> New products are added via <Link href="/invoice" className="font-bold underline">Wholesale Invoices</Link>
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-gray-800"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white">
                        All Categories <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Supplier</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Expiry</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-500">Loading inventory...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-500">No products found.</td></tr>
                        ) : (
                            filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                                                <Hexagon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 leading-tight">{product.name}</p>
                                                <p className="text-[11px] text-gray-400 uppercase tracking-wide mt-0.5">{product.batch_number}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getCategoryBadgeColor(product.category)}`}>
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className="font-bold text-gray-900">{product.stock_quantity}</span>
                                            {getStockBadge(product.stock_quantity)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        Rs. {product.unit_price}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                        {product.supplier}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-bold ${new Date(product.expiry_date) < new Date() ? 'text-red-500' : 'text-gray-600'}`}>
                                            {product.expiry_date}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
