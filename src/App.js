import React from 'react';
import './style/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  BrowserRouter
} from "react-router-dom";
import GraphModuleGlobal from './components/GraphModuleGlobal';
import GraphModuleChoreography from './components/GraphModuleChoreography';
import GraphModuleFlorist from './components/GraphModuleFlorist';
import GraphModuleDriver from './components/GraphModuleDriver';
import GraphModuleCustomer from './components/GraphModuleCustomer';



const App = () => (
  <BrowserRouter>
      <div className="sans-serif">
      <Route exact path="/" component={GraphModuleGlobal} />
      <Route exact path="/public" component={GraphModuleChoreography} />
      <Route exact path="/florist" component={GraphModuleFlorist} />
      <Route exact path="/driver" component={GraphModuleDriver} />
      <Route exact path="/customer" component={GraphModuleCustomer} />

    </div>
  </BrowserRouter>
);

//render(<App />, document.getElementById('root'));
//<Route exact path="/GraphPage" component={GraphModule} />
export default App;
