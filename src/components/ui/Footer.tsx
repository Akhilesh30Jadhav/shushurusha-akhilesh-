import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-emerald-900/20 bg-emerald-950 text-emerald-50 mt-auto relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          <div className="flex items-center gap-3">
            <div className="relative w-24 h-24 bg-white rounded-[1rem] flex items-center justify-center p-2 shadow-md overflow-hidden shrink-0">
               <Image 
                 src="/images/sushrusha_logo.jpeg" 
                 alt="Sushrusha Logo" 
                 fill
                 className="object-contain"
                 priority
               />
            </div>
            <span className="font-extrabold text-2xl md:text-3xl tracking-tight text-white">
              SUSHRUSHA
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm font-semibold text-emerald-200">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
          </div>

          <div className="flex items-center gap-4 text-emerald-400">
            <a href="#" className="p-2 rounded-full hover:bg-emerald-800 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="p-2 rounded-full hover:bg-emerald-800 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="p-2 rounded-full hover:bg-emerald-800 hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
          </div>

        </div>
        
        <div className="mt-10 pt-6 border-t border-emerald-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-emerald-400/80 font-medium">
          <p>© {new Date().getFullYear()} Sushrusha Protocol Training. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-emerald-200 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-200 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
