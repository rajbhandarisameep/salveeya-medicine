'use client';
import { useState, useEffect } from 'react';
import { Search, AlertTriangle, Hexagon } from 'lucide-react';

export default function ExpiredItems() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('http://localhost:8000/api/products/expired')
            .then(res => {
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch expired products:', err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const totalUnits = products.reduce((sum, p) => sum + p.stock_quantity, 0);
    const valueLoss = products.reduce((sum, p) => sum + (p.stock_quantity * p.unit_price), 0);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.batch_number.toLowerCase().includes(search.toLowerCase())
    );

    const getDaysAgo = (dateStr) => {
        const expiry = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now - expiry);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} days ago`;
    };

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)]">

            {/* Header Area */}
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Expired Items</h1>
                    <p className="text-gray-500 text-sm mt-1">Track and manage expired medications</p>
                </div>

                {/* Danger Alert Banner */}
                <div className="bg-danger/50 border border-red-200 rounded-xl p-5 mb-6 flex items-start gap-4">
                    <AlertTriangle className="text-danger-text w-6 h-6 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-danger-text font-bold text-sm">Attention Required</h3>
                        <p className="text-danger-text/80 text-sm mt-1 font-medium">
                            You have {products.length} expired items worth Rs. {valueLoss.toLocaleString()}. Dispose of them properly.
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="border border-gray-100 rounded-xl p-5 shadow-sm bg-white">
                        <h3 className="text-xs font-semibold text-gray-400 mb-2">Expired Products</h3>
                        <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                    </div>
                    <div className="border border-gray-100 rounded-xl p-5 shadow-sm bg-white">
                        <h3 className="text-xs font-semibold text-gray-400 mb-2">Total Units</h3>
                        <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
                    </div>
                    <div className="bg-danger/30 border border-red-100 rounded-xl p-5 shadow-sm">
                        <h3 className="text-xs font-semibold text-gray-500 mb-2">Value Loss</h3>
                        <p className="text-2xl font-bold text-danger-text">Rs. {valueLoss.toLocaleString()}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search expired items..."
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
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/3">Product</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/5">Quantity</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/5">Expiry Date</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/4">Value Loss</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500 font-medium">Loading expired items...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500 font-medium">No expired items found.</td></tr>
                        ) : (
                            filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-red-50/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center border border-red-100 shrink-0">
                                                <Hexagon className="w-5 h-5 text-red-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{product.name}</p>
                                                <p className="text-[11px] text-gray-400 font-medium tracking-wider uppercase mt-1">
                                                    {product.batch_number}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="font-bold text-gray-900">{product.stock_quantity} <span className="text-gray-500 font-medium text-xs ml-1">units</span></span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className="text-sm font-bold text-danger-text">{product.expiry_date}</span>
                                            <span className="bg-red-100 text-danger-text px-2 py-0.5 rounded text-[10px] font-bold">
                                                {getDaysAgo(product.expiry_date)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-bold text-danger-text">
                                        Rs. {(product.stock_quantity * product.unit_price).toLocaleString()}
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
