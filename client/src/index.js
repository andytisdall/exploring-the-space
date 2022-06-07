import React from 'react';
import ReactDOM from 'react-dom';

import Root from './root';
import App from './components/App';

const initialState = {};

const token = localStorage.getItem('token');

if (token) {
  initialState.auth = { isSignedIn: true };
}

ReactDOM.render(
  <Root initialState={initialState}>
    <App />
  </Root>,
  document.querySelector('#root')
);
