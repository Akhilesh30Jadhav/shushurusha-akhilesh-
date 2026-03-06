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

      {/* Hero Section - Split Layout */}
      <main className="flex-grow flex items-center justify-center z-10 py-12 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-6 sm:space-y-8 bg-white/60 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none p-8 lg:p-0 rounded-[2rem] lg:rounded-none shadow-xl lg:shadow-none border border-white/50 lg:border-none">
            <div className="inline-flex items-center rounded-full border border-[#FF7A00]/30 bg-orange-50/80 px-4 py-2 text-xs sm:text-sm text-[#E55A00] font-bold shadow-sm">
              ✨ The Next Generation ASHA Training Simulator
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] drop-shadow-sm">
              Master Clinical <br className="hidden lg:block" /> Protocols with <br className="hidden lg:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF7A00] to-pink-500">Confidence</span> & <br className="hidden md:block lg:hidden" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Precision</span>
            </h1>

            <p className="text-gray-700 text-lg sm:text-xl md:text-2xl font-medium max-w-xl leading-relaxed">
              Interactive scenarios, instant feedback, and certified progress tracking designed exclusively for community health workers in India.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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

          {/* Right Image Content */}
          <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[650px] flex items-center justify-center animate-in fade-in slide-in-from-right-16 duration-1000">
            {/* Decorative blobs behind image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-orange-400/30 to-purple-400/30 blur-3xl rounded-full mix-blend-multiply"></div>
            
            {/* The ASHA Workers Image */}
            <div className="relative w-full h-full max-w-[600px] hover:scale-[1.02] transition-transform duration-500">
              <Image 
                src="/images/hero-asha-workers.jpg" 
                alt="ASHA Workers using Sushrusha App" 
                fill 
                className="object-contain drop-shadow-2xl brightness-[1.05] contrast-[1.05]"
                priority
              />
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
