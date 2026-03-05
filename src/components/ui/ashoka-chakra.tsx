import React from 'react';

export function AshokaChakra({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor">
            {/* Outer Ring */}
            <circle cx="50" cy="50" r="46" strokeWidth="2.5" />
            {/* Inner Ring */}
            <circle cx="50" cy="50" r="39.5" strokeWidth="1" />

            {/* Center Dot */}
            <circle cx="50" cy="50" r="7.5" fill="currentColor" />
            <circle cx="50" cy="50" r="2.5" fill="white" stroke="none" />

            {/* 24 Spokes */}
            <g strokeWidth="1.5" strokeLinecap="round">
                {Array.from({ length: 24 }).map((_, i) => (
                    <path
                        key={`spoke-${i}`}
                        d="M 50 10.5 L 50 43"
                        transform={`rotate(${i * 15} 50 50)`}
                    />
                ))}
            </g>

            {/* 24 Border Dots between spokes */}
            {Array.from({ length: 24 }).map((_, i) => (
                <circle
                    key={`dot-${i}`}
                    cx="50"
                    cy="6.8"
                    r="1.8"
                    fill="currentColor"
                    stroke="none"
                    transform={`rotate(${(i * 15) + 7.5} 50 50)`}
                />
            ))}
        </svg>
    );
}

export function ChakraBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden flex items-center justify-center opacity-[0.03]">
            {/* Navy Blue tint using the official Ashoka Chakra color */}
            <AshokaChakra className="w-[150vw] h-[150vw] sm:w-[80vw] sm:h-[80vw] text-[#000080] mix-blend-multiply" />
        </div>
    );
}
