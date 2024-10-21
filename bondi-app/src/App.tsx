import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./providers/router.provider";
import { NotificationProvider } from "./components/contexts/NotificationContext";
import SlidingNotification from "./components/NotificationComponents/SlidingNotification";
import { AppProvider } from "./providers/app-context";

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
      <SlidingNotification />
    </NotificationProvider>
  );
};

export default App;
