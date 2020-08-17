import React from 'react';
import ReactDOM from 'react-dom';
import './style/index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Web3 from 'web3';
import Web3Provider from 'react-web3-provider';

ReactDOM.render(
    <App />, document.getElementById('root'));

// ReactDOM.render(
    // <React.StrictMode>
    //   <App />
    // </React.StrictMode>,
    // document.getElementById('root')
//   );
  
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();