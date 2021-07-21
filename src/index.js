import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Layout from './components/Layout';
import { HelmetProvider } from 'react-helmet-async';
import FirebaseContextProvider from './contexts/FirebaseContext';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <HelmetProvider>
      <FirebaseContextProvider>
        <App />
      </FirebaseContextProvider>
    </HelmetProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
