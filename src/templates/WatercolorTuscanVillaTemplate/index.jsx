import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Cover from './components/Cover';
import MainContent from './components/MainContent';
import FloatingControls from '../../components/FloatingControls';

const CREAM = '#f8f5f0';

const WatercolorTuscanVillaTemplate = ({ data, isThumbnail }) => {
  const [opened, setOpened] = useState(false);

  return (
    <div style={{
      width: '100%',
      minHeight: isThumbnail ? '100%' : '100dvh',
      height: isThumbnail ? '100%' : (opened ? 'auto' : '100dvh'),
      backgroundColor: CREAM,
      fontFamily: "'Cormorant Garamond', serif",
      position: 'relative',
      isolation: 'isolate',
      overflow: isThumbnail ? 'hidden' : (opened ? 'visible' : 'hidden'),
    }}>
      {/* Universal Floating Controls (Music + Language) */}
      {!isThumbnail && (
        <FloatingControls 
          musicUrl={data?.musicUrl} 
          accentColor="rgba(92,112,72,0.85)" 
        />
      )}

      <AnimatePresence>
        {!opened ? (
          <Cover key="cover" data={data} isThumbnail={isThumbnail} onOpen={() => setOpened(true)} />
        ) : (
          <MainContent key="main" data={data} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatercolorTuscanVillaTemplate;
