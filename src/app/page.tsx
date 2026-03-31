import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans">
      
      {/* Dynamic Colorful Background */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/hero-background.png" 
          alt="Colorful Abstract Background" 
          fill 
          className="object-cover opacity-40 blur-3xl mix-blend-multiply"
          priority
        />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[100px]"></div>
      </div>

      {/* Navbar Minimal */}
      <header className="w-full bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
          {/* Brand Logo Left */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="relative flex items-center justify-center h-10 w-24 sm:h-14 sm:w-32 rounded shadow-sm border border-gray-100 overflow-hidden bg-white flex-shrink-0">
              <Image src="/images/sushrusha_logo.jpeg" alt="Sushrusha Logo" fill className="object-contain" priority />
            </div>
            <div className="hidden md:flex flex-col">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF7A00] to-[#E55A00]">
                Sushrusha
              </h1>
              <span className="text-[10px] text-gray-600 font-semibold tracking-widest uppercase">
                Care • Connect • Educate
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-semibold text-gray-700 hover:text-[#FF7A00] transition-colors">Log in</Link>
            <Link href="/auth/signup" className="text-sm font-semibold px-6 py-2.5 bg-gradient-to-r from-[#FF7A00] to-[#E55A00] text-white rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center z-10 py-10 md:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full flex items-center justify-center">
          
          {/* Hero Text Content */}
          <div className="w-full max-w-3xl mx-auto flex flex-col items-start text-left gap-7 sm:gap-8 py-4 sm:py-6">
            <div className="inline-flex items-center rounded-full border border-[#FF7A00]/30 bg-orange-50/80 px-4 py-2 text-xs sm:text-sm text-[#E55A00] font-bold shadow-sm">
              ✨ The Next Generation ASHA Training Simulator
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.05] drop-shadow-sm">
              <span className="block">Master Clinical</span>
              <span className="block">Protocols with</span>
              <span className="block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF7A00] to-pink-500">Confidence</span> &{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Precision</span>
              </span>
            </h1>

            <p className="text-gray-700 text-base sm:text-xl md:text-2xl font-medium max-w-2xl leading-relaxed">
              Interactive scenarios, instant feedback, and certified progress tracking designed exclusively for community health workers in India.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-gradient-to-r from-[#FF7A00] to-[#E55A00] text-white font-bold text-lg rounded-full shadow-[0_8px_20px_rgb(229,90,0,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_25px_rgb(229,90,0,0.4)] transition-all flex items-center justify-center gap-2"
              >
                Start Free Training
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-white text-gray-800 font-bold text-lg rounded-full shadow-md hover:-translate-y-1 hover:shadow-lg transition-all flex items-center justify-center border border-gray-100"
              >
                View Scenarios
              </Link>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
