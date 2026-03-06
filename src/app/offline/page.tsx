"use client";

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-white px-6 text-center font-sans">
            {/* Logo */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#E55A00] flex items-center justify-center shadow-xl mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-3">You're Offline</h1>
            <p className="text-gray-500 text-base max-w-xs mb-8 leading-relaxed">
                No internet connection detected. You can still access previously visited scenarios once you're back online.
            </p>

            {/* Offline tips */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 max-w-sm w-full mb-8 text-left">
                <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">What you can do:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span> Previously cached scenarios still work
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span> Your session data is saved locally
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-orange-400">↻</span> Scores will sync when you reconnect
                    </li>
                </ul>
            </div>

            <button
                onClick={() => window.location.reload()}
                className="px-8 py-3.5 bg-gradient-to-r from-[#FF7A00] to-[#E55A00] text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-base"
            >
                Try Again
            </button>

            <p className="mt-6 text-xs text-gray-400">SUSHRUSHA — Works offline for ASHA workers</p>
        </div>
    );
}
