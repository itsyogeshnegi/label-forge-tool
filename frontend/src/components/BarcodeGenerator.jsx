import React from 'react';
import Barcode from 'react-barcode';

const BarcodeGenerator = ({ value, height = 40, width = 1.5, displayValue = true }) => {
  if (!value) return null;

  return (
    <div className="flex flex-col items-center justify-center bg-white p-1">
      <Barcode 
        value={value} 
        height={height} 
        width={width}
        fontSize={10}
        margin={0}
        displayValue={displayValue}
        background="#ffffff"
        lineColor="#000000"
      />
    </div>
  );
};

export default BarcodeGenerator;
