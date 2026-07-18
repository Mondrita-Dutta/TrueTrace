import React, { createContext, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const notifySuccess = (msg) => toast.success(msg);
  const notifyError = (msg) => toast.error(msg);
  const notifyInfo = (msg) => toast.info(msg);
  const notifyWarning = (msg) => toast.warning(msg);

  return (
    <NotificationContext.Provider value={{ notifySuccess, notifyError, notifyInfo, notifyWarning }}>
      {children}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
