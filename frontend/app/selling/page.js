'use client';
import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, QrCode, Banknote, RefreshCcw, CheckCircle2, X } from 'lucide-react';

export default function Selling() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);

    // New Feature States
    const [isRefundMode, setIsRefundMode] = useState(false);
    const [vatPercent, setVatPercent] = useState(0);
    const [showSuccessTick, setShowSuccessTick] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);

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

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, cartQuantity: item.cartQuantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, cartQuantity: 1 }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = item.cartQuantity + delta;
                return newQuantity > 0 ? { ...item, cartQuantity: newQuantity } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const handleCheckout = (method) => {
        if (method === 'qr') {
            setShowQrModal(true);
        } else if (method === 'cash') {
            setShowSuccessTick(true);
            setTimeout(() => {
                setShowSuccessTick(false);
                setCart([]); // Clear cart after success
                setIsRefundMode(false); // Reset mode
            }, 2000);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.batch_number.toLowerCase().includes(search.toLowerCase())
    );

    // Calculate totals based on mode
    const multiplier = isRefundMode ? -1 : 1;
    const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.cartQuantity), 0) * multiplier;
    const vatAmount = subtotal * (vatPercent / 100);
    const finalTotal = subtotal + vatAmount;

    return (
        <div className="flex gap-6 max-w-[1400px] mx-auto h-[calc(100vh-8rem)] relative">

            {/* Success Tick Overlay Animation */}
            {showSuccessTick && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl animate-in fade-in duration-300">
                    <div className="flex flex-col items-center animate-in zoom-in duration-300 transform scale-125">
                        <CheckCircle2 className="w-24 h-24 text-green-500 mb-4" />
                        <h2 className="text-3xl font-bold text-gray-900">Completed!</h2>
                    </div>
                </div>
            )}

            {/* QR Code Modal Overlay */}
            {showQrModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center">
                        <div className="w-full flex justify-end">
                            <button onClick={() => setShowQrModal(false)} className="text-gray-400 hover:text-gray-900">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Scan to Pay</h3>
                        <p className="text-gray-500 text-sm mb-6 text-center">Amount: Rs. {finalTotal.toLocaleString()}</p>

                        {/* QR Placeholder. Can replace src later */}
                        <div className="w-48 h-48 bg-gray-100 border border-gray-200 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                            <span className="text-gray-400 font-medium text-sm">QR Image Placeholder</span>
                            {/* <img src="/your-qr-code.png" alt="Payment QR" className="w-full h-full object-cover" /> */}
                        </div>

                        <button
                            onClick={() => { setShowQrModal(false); handleCheckout('cash'); }}
                            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors"
                        >
                            Confirm Payment Received
                        </button>
                    </div>
                </div>
            )}

            {/* Products Section */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">Point of Sale</h1>

                    {/* Refund Toggle inside header */}
                    <button
                        onClick={() => setIsRefundMode(!isRefundMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ml-auto ${isRefundMode
                                ? 'bg-red-500 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <RefreshCcw className="w-4 h-4" />
                        {isRefundMode ? "Refund Mode Active" : "Process Refund"}
                    </button>

                </div>

                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products by name or batch..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="text-center text-gray-500 py-10">Loading products...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredProducts.map(product => {
                                // In refund mode, we don't strictly care if stock is 0 
                                // (since they are bringing it back). But for normal sales, we do.
                                const isActionable = isRefundMode || product.stock_quantity > 0;

                                return (
                                    <div
                                        key={product.id}
                                        onClick={() => isActionable && addToCart(product)}
                                        className={`p-4 rounded-xl border transition-all ${isActionable
                                                ? `border-gray-200 cursor-pointer hover:shadow-md bg-white ${isRefundMode ? 'hover:border-red-500' : 'hover:border-primary'}`
                                                : 'border-red-100 bg-red-50/30 opacity-60 cursor-not-allowed'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900 leading-tight">{product.name}</h3>
                                            <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">
                                                {product.batch_number}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end mt-4">
                                            <div>
                                                <p className="text-sm font-bold text-primary-dark">Rs. {product.unit_price}</p>
                                                <p className={`text-xs mt-1 ${product.stock_quantity > 0 ? 'text-gray-500' : 'text-red-500 font-semibold'}`}>
                                                    {product.stock_quantity} in stock
                                                </p>
                                            </div>
                                            {isActionable && (
                                                <button className={`${isRefundMode ? 'bg-red-100 text-red-600 hover:bg-red-500 hover:text-white' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'} p-2 rounded-lg transition-colors`}>
                                                    {isRefundMode ? <RefreshCcw className="w-4 h-4" /> : <Plus className="w-4 h-4" strokeWidth={3} />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Section */}
            <div className={`w-[420px] bg-white rounded-2xl border ${isRefundMode ? 'border-red-300 shadow-red-100' : 'border-gray-200'} shadow-sm flex flex-col shrink-0 transition-colors`}>
                <div className={`p-6 border-b flex items-center gap-3 ${isRefundMode ? 'bg-red-50 border-red-100 rounded-t-2xl' : 'border-gray-100'}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isRefundMode ? 'bg-red-500 text-white' : 'bg-primary/10 text-primary'}`}>
                        {isRefundMode ? <RefreshCcw className="w-5 h-5 text-white" /> : <ShoppingCart className="w-5 h-5" />}
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${isRefundMode ? 'text-red-900' : 'text-gray-900'}`}>
                            {isRefundMode ? 'Refunding Items' : 'Current Order'}
                        </h2>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            {isRefundMode ? <RefreshCcw className="w-12 h-12 mb-3 opacity-20" /> : <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />}
                            <p>{isRefundMode ? "Refund list is empty" : "Cart is empty"}</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-3 p-3 border border-gray-100 rounded-xl">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">Rs. {item.unit_price} each</p>
                                </div>
                                <div className="flex flex-col items-end justify-between">
                                    <p className={`font-bold text-sm ${isRefundMode ? 'text-red-600' : 'text-primary-dark'}`}>
                                        {isRefundMode ? '-' : ''}Rs. {(item.unit_price * item.cartQuantity).toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => item.cartQuantity === 1 ? removeFromCart(item.id) : updateQuantity(item.id, -1)}
                                            className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600"
                                        >
                                            {item.cartQuantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                                        </button>
                                        <span className="text-xs font-bold w-4 text-center">{item.cartQuantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600"
                                            disabled={!isRefundMode && item.cartQuantity >= item.stock_quantity}
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className={`p-5 border-t ${isRefundMode ? 'border-red-100 bg-red-50/30' : 'border-gray-100 bg-gray-50/50'} rounded-b-xl`}>

                    {/* Calculation rows */}
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Subtotal</span>
                            <span className="font-semibold text-gray-700">Rs. {subtotal.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium flex items-center gap-2">
                                VAT
                                <div className="relative w-16">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={vatPercent}
                                        onChange={(e) => setVatPercent(Number(e.target.value))}
                                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 pr-6 text-xs focus:outline-primary"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                </div>
                            </span>
                            <span className="font-semibold text-gray-700">Rs. {vatAmount.toLocaleString()}</span>
                        </div>

                        <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                            <span className={`font-bold ${isRefundMode ? 'text-red-800' : 'text-gray-800'}`}>Total</span>
                            <span className={`text-2xl font-black tracking-tight ${isRefundMode ? 'text-red-600' : 'text-gray-900'}`}>
                                Rs. {finalTotal.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            className={`py-4 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-white transition-all ${cart.length > 0
                                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-sm hover:shadow-md'
                                    : 'bg-emerald-200 cursor-not-allowed text-emerald-50/70'
                                }`}
                            disabled={cart.length === 0}
                            onClick={() => handleCheckout('cash')}
                        >
                            <Banknote className="w-6 h-6" />
                            <span className="text-sm">{isRefundMode ? 'Refund Cash' : 'Cash'}</span>
                        </button>

                        <button
                            className={`py-4 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-white transition-all ${cart.length > 0
                                    ? 'bg-blue-500 hover:bg-blue-600 shadow-sm hover:shadow-md'
                                    : 'bg-blue-200 cursor-not-allowed text-blue-50/70'
                                }`}
                            disabled={cart.length === 0}
                            onClick={() => handleCheckout('qr')}
                        >
                            <QrCode className="w-6 h-6" />
                            <span className="text-sm">{isRefundMode ? 'Refund via QR' : 'QR Payment'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
