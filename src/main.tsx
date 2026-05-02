import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { DatabaseProvider } from './contexts/DatabaseContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <DatabaseProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DatabaseProvider>
    </AuthProvider>
  </React.StrictMode>,
);
