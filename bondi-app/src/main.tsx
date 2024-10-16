import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { router } from './providers/router.provider';
import AppQueryClientProvider from './providers/query.client-provider';
import { NotificationProvider } from './components/contexts/NotificationContext';
import App from './App';
import './index.css';

const activeChain = 84532; // Base Sepolia testnet

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThirdwebProvider 
      activeChain={activeChain}
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID as string}
    >
      <AppQueryClientProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AppQueryClientProvider>
    </ThirdwebProvider>
  </React.StrictMode>
);
