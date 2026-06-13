import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import CoverPage from './components/CoverPage';
import MainInvitation from './components/MainInvitation';
import FloatingControls from '../../components/FloatingControls';

const BlushRoseEleganceTemplate = ({ data, isThumbnail }) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div
      className="bg-white overflow-x-hidden w-full m-0 p-0 relative"
      style={{ 
        minHeight: isThumbnail ? '100%' : '100dvh', 
        height: isThumbnail ? '100%' : (isOpened ? 'auto' : '100dvh'),
        overflow: isThumbnail ? 'hidden' : (isOpened ? 'visible' : 'hidden')
      }}
    >
      {!isThumbnail && <FloatingControls musicUrl={data?.musicUrl} accentColor="rgba(176,84,112,0.88)" />}
      <AnimatePresence>
        {!isOpened ? (
          <CoverPage key="cover" data={data} onOpen={() => setIsOpened(true)} isThumbnail={isThumbnail} />
        ) : (
          <MainInvitation key="main" data={data} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlushRoseEleganceTemplate;
