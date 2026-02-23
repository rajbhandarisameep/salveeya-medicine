'use client';
import { useState, useEffect } from 'react';
import { Search, Hexagon, AlertOctagon } from 'lucide-react';

export default function OutOfStock() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('http://localhost:8000/api/products/out-of-stock')
            .then(res => {
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch out-of-stock products:', err);
                setLoading(false);
            });
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.batch_number.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-8rem)]">

            {/* Header Area */}
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Out of Stock</h1>
                    <p className="text-gray-500 text-sm mt-1">Products that need immediate restocking</p>
                </div>

                {/* Alert Banner */}
                <div className="bg-warning/50 border border-yellow-200 rounded-xl p-5 mb-6 flex items-start gap-4">
                    <AlertOctagon className="text-yellow-600 w-6 h-6 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-yellow-700 font-bold text-sm">Restock Required</h3>
                        <p className="text-yellow-700/80 text-sm mt-1 font-medium">
                            You have {products.length} items that are completely out of stock. Order them via New Invoice to replenish inventory.
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search out-of-stock items..."
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
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/4">Category</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/4">Supplier</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/6 text-right">Last Price</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500 font-medium">Loading out-of-stock items...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500 font-medium">No items currently out of stock.</td></tr>
                        ) : (
                            filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-yellow-50/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center border border-yellow-100 shrink-0">
                                                <Hexagon className="w-5 h-5 text-yellow-500" />
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
                                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-semibold text-gray-600">{product.supplier}</span>
                                    </td>
                                    <td className="px-6 py-5 font-bold text-gray-900 text-right">
                                        Rs. {product.unit_price}
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
