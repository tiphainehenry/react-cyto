import React from 'react';
import Header from './Header';
import DCRgraph from './DCRgraph'

var data = require('../resources/dataCustomer.json')

class GraphModuleFlorist extends React.Component {
  constructor(props){
    super(props);
    this.state = {id:'Customer',
                  data:data
                };
  }

  render(){
    return  <div>
             <Header/>
             <DCRgraph id={this.state.id} data={this.state.data}/>
            </div>; 
  }
}

export default GraphModuleFlorist
