import React from 'react';

const IPhoneMockup = ({ children }) => {
  return (
    <div className="relative mx-auto border-luxury-gray bg-luxury-gray border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl animate-float">
      <div className="h-[32px] w-[3px] bg-luxury-gray absolute -left-[17px] top-[72px] rounded-l-lg"></div>
      <div className="h-[46px] w-[3px] bg-luxury-gray absolute -left-[17px] top-[124px] rounded-l-lg"></div>
      <div className="h-[46px] w-[3px] bg-luxury-gray absolute -left-[17px] top-[178px] rounded-l-lg"></div>
      <div className="h-[64px] w-[3px] bg-luxury-gray absolute -right-[17px] top-[142px] rounded-r-lg"></div>
      <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white">
        {children}
      </div>
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-luxury-gray rounded-b-2xl"></div>
    </div>
  );
};

export default IPhoneMockup;
