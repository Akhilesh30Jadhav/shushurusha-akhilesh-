"use client";

import { LayoutDashboard, Users, Activity, Settings, LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { name: "Overview", url: "/admin", icon: LayoutDashboard },
        { name: "Workers", url: "/admin/users", icon: Users },
        { name: "Analytics", url: "/admin/analytics", icon: Activity },
        { name: "Settings", url: "/admin/settings", icon: Settings },
    ];

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/auth/login');
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-20">
                {/* Brand */}
                <div className="h-20 flex items-center px-6 border-b border-gray-100">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded shrink-0 overflow-hidden border border-gray-100 bg-white">
                            <Image src="/images/sushrusha_logo.jpeg" alt="Logo" fill className="object-contain" />
                        </div>
                        <span className="font-bold text-lg text-gray-900 tracking-tight">Admin Portal</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Menu</div>
                    {navItems.map((item) => {
                        const isActive = pathname === item.url;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.url}
                                href={item.url}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}

                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                            Exit to App
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors mt-1">
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header Navbar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-10 sticky top-0">
                    <h2 className="text-xl font-bold text-gray-800">
                        {pathname === '/admin' ? 'Dashboard Overview' : pathname.includes('users') ? 'User Directory' : 'Admin Portal'}
                    </h2>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold font-mono text-sm border border-orange-200">
                            AD
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-4 sm:p-8 relative">
                    {children}
                </div>
            </main>
        </div>
    );
}
