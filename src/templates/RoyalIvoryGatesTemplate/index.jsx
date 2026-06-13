import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import EnvelopeIntro from './components/EnvelopeIntro';
import MainContent from './components/MainContent';
import FloatingControls from '../../components/FloatingControls';

const RoyalIvoryGatesTemplate = ({ data, isThumbnail }) => {
  const [opened, setOpened] = useState(false);

  return (
    <div style={{ width: '100%', minHeight: isThumbnail ? '100%' : '100vh', height: isThumbnail ? '100%' : 'auto', overflowX: 'hidden', backgroundColor: '#FFFAF0', fontFamily: "'Lato', sans-serif", color: '#2C3E50', position: 'relative' }}>
      {!isThumbnail && <FloatingControls musicUrl={data?.musicUrl} accentColor="rgba(120,90,50,0.88)" />}
      <AnimatePresence>
        {!opened && (
          <EnvelopeIntro key="intro" data={data} onOpen={() => setOpened(true)} isThumbnail={isThumbnail} />
        )}
      </AnimatePresence>
      {opened && <MainContent data={data} />}
    </div>
  );
};

export default RoyalIvoryGatesTemplate;
