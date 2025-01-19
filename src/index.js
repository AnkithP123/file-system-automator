import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AI from './AI';
import FileFlicker from './FileFlicker';
import reportWebVitals from './reportWebVitals';

const RootComponent = () => {
  return (
    <React.StrictMode>
      <div className="container">
        <div className="flicker-container">
          <FileFlicker />
        </div>
        <div className="ai-container">
          <AI />
        </div>
      </div>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RootComponent />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();