import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Sushrusha ASHA Platform',
        short_name: 'Sushrusha',
        description: 'ASHA Worker Virtual Training Platform',
        start_url: '/dashboard',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FF7A00',
        icons: [
            {
                src: '/images/sushrusha_logo.jpeg',
                sizes: '192x192',
                type: 'image/jpeg',
            },
            {
                src: '/images/sushrusha_logo.jpeg',
                sizes: '512x512',
                type: 'image/jpeg',
            },
        ],
    };
}
