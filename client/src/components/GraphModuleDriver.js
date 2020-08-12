import React from 'react';
import Header from './Header';
import DCRgraph from './DCRgraph';

var data = require('../projections/dataDriver.json');
var execLogs = require('../projections/execDriver.json');

class GraphModuleFlorist extends React.Component {
  constructor(props){
    super(props);
    this.state = {id:'Driver',
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
