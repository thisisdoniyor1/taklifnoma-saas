import React from 'react';
import Template1 from '../templates/Template1';
import Template2 from '../templates/Template2';

const TemplateManager = ({ templateId, data }) => {
  const templates = {
    'luxury-gold': Template1,
    'classic-minimalist': Template2,
    // Add more templates as needed
  };

  const SelectedTemplate = templates[templateId] || Template1;

  return <SelectedTemplate data={data} />;
};

export default TemplateManager;
