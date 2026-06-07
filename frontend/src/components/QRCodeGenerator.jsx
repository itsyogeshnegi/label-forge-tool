import React from 'react';
import QRCode from 'react-qr-code';

const QRCodeGenerator = ({ value, size = 64 }) => {
  if (!value) return null;

  return (
    <div className="inline-block bg-white p-1">
      <QRCode 
        value={value} 
        size={size}
        level="M"
        fgColor="#000000"
        bgColor="#ffffff"
      />
    </div>
  );
};

export default QRCodeGenerator;
