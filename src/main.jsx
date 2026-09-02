import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { RideWaveProvider } from './context/RideWaveContext.jsx';
import './styles/index.css';
import './styles/map.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RideWaveProvider>
      <App />
    </RideWaveProvider>
  </React.StrictMode>
);
