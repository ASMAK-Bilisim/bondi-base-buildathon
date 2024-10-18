import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThirdwebProvider } from "thirdweb/react";
import AppQueryClientProvider from './providers/query.client-provider';
import { NotificationProvider } from './components/contexts/NotificationContext';
import App from './App';
import './index.css';
import { client } from './client';
import { lightTheme } from "thirdweb/react";
import { baseSepolia } from "thirdweb/chains";

const customTheme = lightTheme({
  colors: {
    primaryButtonBg: "#f2fbf9",
    primaryButtonText: "#1C544E",
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThirdwebProvider 
      client={client} 
      activeChain={baseSepolia}
      supportedChains={[baseSepolia]}
      theme={customTheme}
    >
      <AppQueryClientProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AppQueryClientProvider>
    </ThirdwebProvider>
  </React.StrictMode>
);
