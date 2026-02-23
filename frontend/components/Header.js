import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

const routeNames = {
    '/': 'Home',
    '/selling': 'Selling',
    '/inventory': 'Inventory',
    '/invoice': 'Wholesale Invoices',
    '/expired': 'Expired Items',
    '/out-of-stock': 'Out of Stock',
};

export default function Header() {
    const pathname = usePathname();
    const pageTitle = routeNames[pathname] || 'Dashboard';

    return (
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
            <h2 className="text-lg font-medium text-gray-800">{pageTitle}</h2>

            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
        </header>
    );
}
