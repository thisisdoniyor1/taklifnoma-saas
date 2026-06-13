import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans selection:bg-gold-500 selection:text-white pb-20">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-6 pt-32 sm:pt-40">
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-900/40 hover:text-emerald-950 transition-colors mb-8 sm:mb-12">
          <ChevronLeft size={16} />
          <span className="text-[10px] font-extrabold uppercase tracking-[2px]">Back to Home</span>
        </Link>
        
        <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-emerald-900/10 shadow-[0_40px_80px_-20px_rgba(6,78,59,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gold-100/30 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black text-emerald-950 mb-8 uppercase tracking-[-0.02em]">Privacy Policy</h1>
            
            <div className="space-y-6 text-sm sm:text-base text-emerald-900/70 leading-relaxed">
              <p>
                Your privacy is important to us. It is Taklifnoma.vip's policy to respect your privacy regarding any information we may collect from you across our website.
              </p>
              
              <h2 className="text-xl font-bold text-emerald-950 mt-8 mb-4">1. Information we collect</h2>
              <p>
                We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we're collecting it and how it will be used.
              </p>
              
              <h2 className="text-xl font-bold text-emerald-950 mt-8 mb-4">2. Use of Information</h2>
              <p>
                We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we'll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
              </p>
              
              <h2 className="text-xl font-bold text-emerald-950 mt-8 mb-4">3. Data Sharing</h2>
              <p>
                We don't share any personally identifying information publicly or with third-parties, except when required to by law.
              </p>
              
              <h2 className="text-xl font-bold text-emerald-950 mt-8 mb-4">4. Your Rights</h2>
              <p>
                You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services. Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
