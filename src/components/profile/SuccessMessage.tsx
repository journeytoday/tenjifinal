import React from 'react';

interface SuccessMessageProps {
  message: string;
}

const SuccessMessage = ({ message }: SuccessMessageProps) => {
  return (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
      <p>{message}</p>
    </div>
  );
};

export default SuccessMessage;