import React from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import './Styles/index.css';
import App from './App';
import store from './Redux/store';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
