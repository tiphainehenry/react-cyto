import React from 'react';
import './App.css';
import Main from './components/Main';
import Header from './components/Header'
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  BrowserRouter
} from "react-router-dom";
import GraphModule from './components/GraphModule';



const App = () => (
  <BrowserRouter>
      <div className="sans-serif">
      <Route exact path="/" component={Main} />
      <Route exact path="/graph" component={GraphModule} />

    </div>
  </BrowserRouter>
);

//render(<App />, document.getElementById('root'));
//<Route exact path="/GraphPage" component={GraphModule} />
export default App;
