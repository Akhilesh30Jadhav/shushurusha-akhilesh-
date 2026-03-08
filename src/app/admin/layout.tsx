import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // Get the current pathname from headers
    const headersList = await headers();
    const pathname = headersList.get("x-nextjs-path") || headersList.get("x-invoke-path") || "";

    // Admin login page: render without sidebar/header
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const session = await getSession();

    if (!session) {
        redirect("/admin/login");
    }

    // Verify admin role from database
    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        select: { id: true, display_name: true, email: true, role: true },
    });

    if (!user || user.role !== "admin") {
        redirect("/admin/login");
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <AdminSidebar userName={user.display_name || "Admin"} userEmail={user.email || ""} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header Navbar */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-[3px] bg-orange-500 rounded-full" />
                        <h2 className="text-lg font-bold text-gray-800">Admin Dashboard</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 hidden sm:block">{user.display_name || "Admin"}</span>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {(user.display_name || "A").charAt(0).toUpperCase()}
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
