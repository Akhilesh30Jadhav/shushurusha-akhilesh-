import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-orange-100/50 bg-white/80 backdrop-blur-xl text-gray-800 mt-auto relative z-50 shadow-[0_-4px_24px_0_rgba(255,122,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-5">

          <div className="flex items-center gap-2.5">
            <div className="relative w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm border border-gray-100 overflow-hidden shrink-0">
              <Image
                src="/images/sushrusha_logo.jpeg"
                alt="Sushrusha Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">
              SUSHRUSHA
            </span>
          </div>

          <div className="flex items-center gap-5 text-sm font-bold text-gray-500">
            <Link href="/" className="hover:text-[#FF7A00] transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-[#FF7A00] transition-colors">Dashboard</Link>
            <Link href="/profile" className="hover:text-[#FF7A00] transition-colors">Profile</Link>
          </div>

          <div className="flex flex-row items-center gap-3 text-gray-400">
            <a href="#" className="p-2 rounded-full hover:bg-orange-50 hover:text-[#FF7A00] transition-colors shadow-sm border border-transparent hover:border-orange-100/50"><Github className="w-4.5 h-4.5" /></a>
            <a href="#" className="p-2 rounded-full hover:bg-orange-50 hover:text-[#FF7A00] transition-colors shadow-sm border border-transparent hover:border-orange-100/50"><Twitter className="w-4.5 h-4.5" /></a>
            <a href="#" className="p-2 rounded-full hover:bg-orange-50 hover:text-[#FF7A00] transition-colors shadow-sm border border-transparent hover:border-orange-100/50"><Mail className="w-4.5 h-4.5" /></a>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500 font-medium">
          <p>© {new Date().getFullYear()} Sushrusha Protocol Training. All rights reserved.</p>
          <div className="flex gap-3">
            <a href="#" className="hover:text-[#FF7A00] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#FF7A00] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
