import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const InvitationContext = createContext();
const DEFAULT_WELCOME_TEXT = 'We invite you to share in the joy of our wedding day. Your presence will make our celebration complete as we begin our new life together.';

export const useInvitation = () => {
  const context = useContext(InvitationContext);
  if (!context) {
    throw new Error('useInvitation must be used within an InvitationProvider');
  }
  return context;
};

export const InvitationProvider = ({ children }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [invitationData, setInvitationData] = useState({
    templateId: 'royal-gold',
    groomName: '',
    brideName: '',
    date: '',
    time: '',
    location: '',
    locationUrl: '',
    musicUrl: '',
    image_url: '',
    images: [],
    welcomeText: '',
    rsvpStatus: false,
    phone: '',
  });

  const updateInvitation = useCallback((newData) => {
    setInvitationData((prev) => ({ ...prev, ...newData }));
  }, []);

  const resetInvitation = useCallback(() => {
    setActiveStep(1);
    setInvitationData({
      templateId: 'royal-gold',
      groomName: '',
      brideName: '',
      date: '',
      time: '',
      location: '',
      locationUrl: '',
      musicUrl: '',
      image_url: '',
      images: [],
      welcomeText: '',
      rsvpStatus: false,
      phone: '',
    });
  }, []);

  const value = useMemo(() => ({
    invitationData,
    updateInvitation,
    activeStep,
    setActiveStep,
    resetInvitation,
  }), [activeStep, invitationData, resetInvitation, updateInvitation]);

  return (
    <InvitationContext.Provider value={value}>
      {children}
    </InvitationContext.Provider>
  );
};
