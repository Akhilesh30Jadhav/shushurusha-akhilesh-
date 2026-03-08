"use client";

import { useEffect, useState } from 'react';
import { Settings, Loader2, Shield, ShieldCheck, ShieldOff, Users, Info } from 'lucide-react';

type UserRow = {
    id: string;
    name: string;
    email: string;
    role: string;
};

export default function SettingsPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/workers')
            .then(res => res.json())
            .then(data => {
                if (data.workers) {
                    setUsers(data.workers.map((w: any) => ({
                        id: w.id,
                        name: w.name,
                        email: w.email,
                        role: w.role || 'user',
                    })));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        setUpdating(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            const data = await res.json();
            if (data.user) {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: data.user.role } : u));
            } else if (data.error) {
                alert(data.error);
            }
        } catch {
            alert('Failed to update role');
        }
        setUpdating(null);
    };

    if (loading) {
        return <div className="flex h-[calc(100vh-5rem)] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;
    }

    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user').length;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-gray-500" />
                    Settings
                </h1>
                <p className="text-gray-500 text-sm mt-1">Manage platform settings and user roles.</p>
            </div>

            {/* Role Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{adminCount}</div>
                        <div className="text-xs font-medium text-gray-500">Admin Users</div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{userCount}</div>
                        <div className="text-xs font-medium text-gray-500">Regular Users</div>
                    </div>
                </div>
            </div>

            {/* Info Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-800">
                    <strong>Role Management:</strong> Promoting a user to admin gives them full access to this admin dashboard, including the ability to manage other users&apos; roles. You cannot demote yourself.
                </div>
            </div>

            {/* User Role Management */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400" /> User Role Management
                    </h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {users.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No users found.</div>
                    ) : (
                        users.map(user => (
                            <div key={user.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${user.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-gray-900 truncate">{user.name}</div>
                                        <div className="text-xs text-gray-400 truncate">{user.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${user.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {user.role === 'admin' ? 'Admin' : 'User'}
                                    </span>
                                    <button
                                        onClick={() => toggleRole(user.id, user.role)}
                                        disabled={updating === user.id}
                                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${user.role === 'admin'
                                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                                            }`}
                                    >
                                        {updating === user.id ? (
                                            <Loader2 className="w-3 h-3 animate-spin inline" />
                                        ) : user.role === 'admin' ? (
                                            <span className="flex items-center gap-1"><ShieldOff className="w-3 h-3" /> Demote</span>
                                        ) : (
                                            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Promote</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
