import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import App from './App';
import { register, unregister } from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (process.env.NODE_ENV === "production") {
  register();
} else {
  unregister();
}
