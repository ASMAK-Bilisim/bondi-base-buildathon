import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { router } from './providers/router.provider';

const App: React.FC = () => {
  return (
    <ThirdwebProvider clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}>
      <RouterProvider router={router} />
    </ThirdwebProvider>
  );
};

export default App;