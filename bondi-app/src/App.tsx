import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './providers/router.provider';
import { NotificationProvider } from './components/contexts/NotificationContext';
import SlidingNotification from './components/NotificationComponents/SlidingNotification';

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <RouterProvider router={router} />
      <SlidingNotification />
    </NotificationProvider>
  );
};

export default App;
