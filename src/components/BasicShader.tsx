import React from 'react';

const BasicShader: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 -z-10" 
      style={{
        backgroundImage: 'linear-gradient(45deg, #003300, #006600)',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -10,
      }}
    />
  );
};

export default BasicShader; 