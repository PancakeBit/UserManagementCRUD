import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/cutive-mono';
import '@fontsource-variable/work-sans';
import App from './App.jsx';
import { ToastProvider } from './hooks/useToasts.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>
);
