import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans selection:bg-gold-500 selection:text-white pb-20">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-6 pt-32 sm:pt-40">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-900/40 hover:text-emerald-950 transition-colors mb-8 sm:mb-12">
          <ChevronLeft size={16} />
          <span className="text-[10px] font-extrabold uppercase tracking-[2px]">Back to Home</span>
        </Link>
        
        <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-emerald-900/10 shadow-[0_40px_80px_-20px_rgba(6,78,59,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/30 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black text-emerald-950 mb-8 uppercase tracking-[-0.02em]">Terms of Use</h1>
            
            <div className="space-y-6 text-sm sm:text-base text-emerald-900/70 leading-relaxed">
              <p>
                Welcome to Taklifnoma.vip. By accessing or using our platform, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
              
              <h2 className="text-xl font-bold text-emerald-950 mt-8 mb-4">1. Use License</h2>
              <p>
                Permission is granted to temporarily use the materials (information or software) on Taklifnoma.vip's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
              
              <h2 className="text-xl font-bold text-emerald-950 mt-8 mb-4">2. Disclaimer</h2>
              <p>
                The materials on Taklifnoma.vip's website are provided on an 'as is' basis. Taklifnoma.vip makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              
              <h2 className="text-xl font-bold text-emerald-950 mt-8 mb-4">3. Limitations</h2>
              <p>
                In no event shall Taklifnoma.vip or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Taklifnoma.vip's website.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
