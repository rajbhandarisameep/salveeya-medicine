'use client';
import { useEffect, useState } from 'react';
import { DollarSign, Package, ShoppingCart, Users, AlertTriangle, Hexagon, ArrowRight, Hand } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We will seed the DB first if empty
        fetch('http://localhost:8000/api/seed', { method: 'POST' }).finally(() => {
            Promise.all([
                fetch('http://localhost:8000/api/dashboard').then(res => res.json()),
                fetch('http://localhost:8000/api/products').then(res => res.json())
            ]).then(([dashboardStats, productList]) => {
                setStats(dashboardStats);
                setProducts(productList.slice(0, 4)); // Get top 4 for overview
                setLoading(false);
            }).catch(err => {
                console.error('Failed to fetch dashboard data:', err);
                setLoading(false);
            });
        });
    }, []);

    if (loading) {
        return <div className="h-full flex items-center justify-center">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto">
            {/* Welcome Banner */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Welcome back! <Hand className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Here's what's happening at your pharmacy today.</p>
                </div>
                <Link href="/selling" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <ShoppingCart className="w-4 h-4" />
                    New Sale
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Sales Card */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Today's Sales</p>
                        <h3 className="text-2xl font-bold text-gray-900">Rs. {stats?.todays_sales || 0}</h3>
                        <p className="text-xs text-gray-400 mt-1">{stats?.transactions_today || 0} transactions</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>

                {/* Total Products */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Total Products</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.total_products || 0}</h3>
                        <p className="text-xs text-gray-400 mt-1">In Inventory</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <Hexagon className="w-6 h-6" />
                    </div>
                </div>

                {/* Orders */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Orders Today</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.transactions_today || 0}</h3>
                        <p className="text-xs text-gray-400 mt-1">Transactions</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                </div>

                {/* All Time */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">All Time Sales</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.all_time_sales || 0}</h3>
                        <p className="text-xs text-gray-400 mt-1">{stats?.total_records || 0} total records</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Alerts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/expired" className="block cursor-pointer">
                    <div className="bg-danger rounded-xl p-5 flex items-center justify-between border border-red-100 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-500 shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-red-600 font-bold text-lg">{stats?.expired_items || 0} <span className="font-semibold text-gray-800 text-sm">Expired Items</span></h3>
                                <p className="text-gray-500 text-xs mt-0.5">Need immediate attention</p>
                            </div>
                        </div>
                        <ArrowRight className="text-gray-400 w-5 h-5" />
                    </div>
                </Link>

                <Link href="/out-of-stock" className="block cursor-pointer">
                    <div className="bg-warning rounded-xl p-5 flex items-center justify-between border border-yellow-200 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-yellow-500 shrink-0">
                                <Hexagon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-yellow-600 font-bold text-lg">{stats?.low_stock_items || 0} <span className="font-semibold text-gray-800 text-sm">Low / Out of Stock</span></h3>
                                <p className="text-gray-500 text-xs mt-0.5">Need restocking</p>
                            </div>
                        </div>
                        <ArrowRight className="text-gray-400 w-5 h-5" />
                    </div>
                </Link>
            </div>

            {/* Main Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Sales */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-80">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Recent Sales</h3>
                        <Link href="/selling" className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                        No sales yet
                    </div>
                </div>

                {/* Products Overview */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-80">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Products Overview</h3>
                        <Link href="/inventory" className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1">
                            View inventory <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="p-5 flex-1 overflow-auto space-y-5">
                        {products.map((product, index) => (
                            <div key={product.id} className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-3 items-center">
                                        <span className="bg-primary text-white w-5 h-5 rounded flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 leading-tight">{product.name}</p>
                                            <p className="text-[10px] text-gray-400">{product.stock_quantity} in stock</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-primary-dark">Rs. {product.unit_price}</div>
                                </div>
                                {/* Visual Fake Progress Bar */}
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${Math.min((product.stock_quantity / 1000) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
