import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThirdwebProvider } from "@thirdweb-dev/react";
import './index.css';
import App from './App';

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <ThirdwebProvider activeChain="localhost">
        <App />
      </ThirdwebProvider>
    </React.StrictMode>
  );
}