import React from 'react';
import InvitationScenes from './components/InvitationScenes';
import FloatingControls from '../../components/FloatingControls';

const PremiumTemplate = ({ data, templateId, isThumbnail }) => {
  return (
    <div style={{ position: 'relative' }}>
      {!isThumbnail && <FloatingControls musicUrl={data?.musicUrl} accentColor="rgba(80,60,100,0.88)" />}
      <InvitationScenes data={data} templateId={templateId} />
    </div>
  );
};

export default PremiumTemplate;
