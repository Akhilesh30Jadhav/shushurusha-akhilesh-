import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'SUSHRUSHA | Protocol Training Simulator',
        short_name: 'Sushrusha',
        description: 'Immersive AI-powered clinical protocol training for ASHA workers — works offline.',
        start_url: '/dashboard',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#FF7A00',
        categories: ['education', 'health', 'medical'],
        icons: [
            {
                src: '/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/apple-touch-icon.png',
                sizes: '180x180',
                type: 'image/png',
            },
        ],
        shortcuts: [
            {
                name: 'Scenarios',
                url: '/scenarios',
                description: 'Browse all training scenarios',
            },
            {
                name: 'Dashboard',
                url: '/dashboard',
                description: 'Go to your training dashboard',
            },
        ],
    };
}
