"use client";

import { LayoutDashboard, Users, BarChart3, BookOpen, Settings, LogOut, ArrowLeft, Shield, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface AdminSidebarProps {
    userName: string;
    userEmail: string;
}

export default function AdminSidebar({ userName, userEmail }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { name: "Overview", url: "/admin", icon: LayoutDashboard },
        { name: "Workers", url: "/admin/users", icon: Users },
        { name: "Analytics", url: "/admin/analytics", icon: BarChart3 },
        { name: "Scenarios", url: "/admin/scenarios", icon: BookOpen },
        { name: "Settings", url: "/admin/settings", icon: Settings },
    ];

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/auth/login');
    };

    const sidebarContent = (
        <>
            {/* Brand */}
            <div className="h-16 flex items-center px-5 border-b border-gray-100 shrink-0">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-lg shrink-0 overflow-hidden border border-gray-100 bg-white">
                        <Image src="/images/sushrusha_logo.jpeg" alt="Logo" fill className="object-contain" />
                    </div>
                    <div>
                        <span className="font-bold text-base text-gray-900 tracking-tight block leading-tight">Sushrusha</span>
                        <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-widest">Admin</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5 overflow-y-auto">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-3">Navigation</div>
                {navItems.map((item) => {
                    const isActive = pathname === item.url || (item.url !== "/admin" && pathname.startsWith(item.url));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.url}
                            href={item.url}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                ? 'bg-orange-50 text-orange-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="px-3 pb-4 pt-2 border-t border-gray-100 shrink-0">
                {/* Admin Info */}
                <div className="flex items-center gap-3 px-3 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{userName}</div>
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-orange-500">
                            <Shield className="w-3 h-3" /> Admin
                        </div>
                    </div>
                </div>

                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to App
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-white rounded-xl shadow-md border border-gray-200"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/30 z-30" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar - mobile */}
            <aside className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-40 transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {sidebarContent}
            </aside>

            {/* Sidebar - desktop */}
            <aside className="hidden lg:flex w-60 bg-white border-r border-gray-200 flex-col flex-shrink-0 z-20">
                {sidebarContent}
            </aside>
        </>
    );
}
