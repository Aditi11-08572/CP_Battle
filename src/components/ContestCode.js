import React from 'react';

const ContestCode = ({ contestCode, onCopy }) => {
  return (
    <div>
      <span>{contestCode}</span>
      <button onClick={() => onCopy(contestCode)}>Copy Code</button>
    </div>
  );
};

export default ContestCode;
