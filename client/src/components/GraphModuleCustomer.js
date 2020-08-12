import React from 'react';
import Header from './Header';
import DCRgraph from './DCRgraph';

var data = require('../projections/dataCustomer.json');
var execLogs = require('../projections/execCustomer.json');

class GraphModuleFlorist extends React.Component {
  constructor(props){
    super(props);
    this.state = {id:'Customer',
                  data:data,
                  execLogs:execLogs
                };
  }

  render(){
    return  <div>
             <Header/>
             <DCRgraph id={this.state.id} data={this.state.data} execLogs={this.state.execLogs}/>
            </div>; 
  }
}

export default GraphModuleFlorist
