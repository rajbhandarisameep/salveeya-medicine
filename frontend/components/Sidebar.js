import { HeartPulse, LayoutDashboard, ShoppingCart, Box, FileText, AlertTriangle, XOctagon, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
    { name: 'Home', href: '/', icon: LayoutDashboard },
    { name: 'Selling', href: '/selling', icon: ShoppingCart },
    { name: 'Inventory', href: '/inventory', icon: Box },
    { name: 'Invoice', href: '/invoice', icon: FileText },
    { name: 'Expired Items', href: '/expired', icon: AlertTriangle, danger: true },
    { name: 'Out of Stock', href: '/out-of-stock', icon: XOctagon },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white h-full shrink-0">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-primary flex items-center justify-center rounded-lg w-10 h-10 shrink-0">
                    <HeartPulse className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="font-bold text-gray-900 leading-tight">Salveeya Medicine</h1>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase">Management System</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? item.danger
                                        ? 'bg-danger text-danger-text'
                                        : 'bg-primary-light text-primary-dark'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className="w-5 h-5" strokeWidth={1.5} />
                            {item.name}
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">Admin User</p>
                        <p className="text-xs text-gray-500">Pharmacist</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
