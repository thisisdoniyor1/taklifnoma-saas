import React, { createContext, useContext, useState } from 'react';

const InvitationContext = createContext();

export const useInvitation = () => {
  const context = useContext(InvitationContext);
  if (!context) {
    throw new Error('useInvitation must be used within an InvitationProvider');
  }
  return context;
};

export const InvitationProvider = ({ children }) => {
  const [invitationData, setInvitationData] = useState({
    templateId: 'luxury-gold',
    groomName: '',
    brideName: '',
    date: '',
    time: '',
    location: '',
    locationUrl: '',
    musicUrl: '',
    images: [],
    welcomeText: 'Bizning baxtli kunimizga xush kelibsiz!',
    rsvpStatus: false,
    phone: '',
  });

  const updateInvitation = (newData) => {
    setInvitationData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <InvitationContext.Provider value={{ invitationData, updateInvitation }}>
      {children}
    </InvitationContext.Provider>
  );
};
