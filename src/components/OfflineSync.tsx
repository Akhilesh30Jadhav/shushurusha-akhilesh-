"use client";

import { useEffect, useState } from 'react';
import { Wifi, Loader2 } from 'lucide-react';

export function OfflineSync() {
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncCount, setSyncCount] = useState(0);

    const checkAndSync = async () => {
        const queueStr = localStorage.getItem('offlineSessionQueue');
        if (!queueStr) return;

        const queue: any[] = JSON.parse(queueStr);
        if (queue.length === 0) return;

        if (navigator.onLine) {
            setIsSyncing(true);
            setSyncCount(queue.length);

            const remaining = [];
            for (const payload of queue) {
                try {
                    const res = await fetch('/api/sessions/mcq/complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!res.ok) throw new Error('Sync failed');
                } catch (e) {
                    remaining.push(payload);
                }
            }

            localStorage.setItem('offlineSessionQueue', JSON.stringify(remaining));
            setIsSyncing(false);
            setSyncCount(0);
        }
    };

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            checkAndSync();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        checkAndSync();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOnline) {
        return (
            <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 text-sm font-bold animate-in slide-in-from-bottom">
                <Wifi className="w-4 h-4" /> You are offline. Data will sync later.
            </div>
        );
    }

    if (isSyncing) {
        return (
            <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 text-sm font-bold animate-in slide-in-from-bottom">
                <Loader2 className="w-4 h-4 animate-spin" /> Syncing {syncCount} offline records...
            </div>
        );
    }

    return null;
}
