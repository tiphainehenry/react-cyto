import React from 'react';
import './style/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  BrowserRouter
} from "react-router-dom";
import TestMenu from './components/testMenu';
import ViewGlobal from './components/ViewGlobal';
import ViewPublic from './components/ViewPublic';
import ViewR1 from './components/ViewR1';
import ViewR2 from './components/ViewR2';
import ViewR3 from './components/ViewR3';
import ViewR4 from './components/ViewR4';
import ViewR5 from './components/ViewR5';
import ViewR6 from './components/ViewR6';
import ViewR7 from './components/ViewR7';
import ViewR8 from './components/ViewR8';
import ViewR9 from './components/ViewR9';
import ViewR10 from './components/ViewR10';


const App = () => (
  <BrowserRouter>
      <div className="sans-serif">
      <Route exact path="/" component={TestMenu} />
      <Route exact path="/project" component={ViewGlobal} />
      <Route exact path="/public" component={ViewPublic} />
      <Route exact path="/r1" component={ViewR1} />
      <Route exact path="/r2" component={ViewR2} />
      <Route exact path="/r3" component={ViewR3} />
      <Route exact path="/r4" component={ViewR4} />
      <Route exact path="/r5" component={ViewR5} />
      <Route exact path="/r6" component={ViewR6} />
      <Route exact path="/r7" component={ViewR7} />
      <Route exact path="/r8" component={ViewR8} />
      <Route exact path="/r9" component={ViewR9} />
      <Route exact path="/r10" component={ViewR10} />
    </div>
  </BrowserRouter>
);

//render(<App />, document.getElementById('root'));
//<Route exact path="/GraphPage" component={View} />
export default App;
