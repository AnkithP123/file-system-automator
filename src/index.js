import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AI from './AI';
import FileFlicker from './FileFlicker';
import reportWebVitals from './reportWebVitals';

const RootComponent = () => {
  const [component, setComponent] = useState(null);

  const handleSelection = (choice) => {
    if (choice === 'AI') {
      setComponent(<AI />);
    } else if (choice === 'FileFlicker') {
      setComponent(<FileFlicker />);
    } else {
      alert("Invalid choice. Please try again.");
    }
  };

  return (
    <React.StrictMode>
      {!component ? (
        <div>
          <button onClick={() => handleSelection('AI')}>Show AI Component</button>
          <button onClick={() => handleSelection('FileFlicker')}>Show FileFlicker Component</button>
        </div>
      ) : (
        component
      )}
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RootComponent />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
