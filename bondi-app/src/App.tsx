import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './providers/router.provider';
import SlidingNotification from './components/NotificationComponents/SlidingNotification';

const App: React.FC = () => {
  return (
    <>
      <RouterProvider router={router} />
      <SlidingNotification />
    </>
  );
};

export default App;
