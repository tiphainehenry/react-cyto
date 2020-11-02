import React from 'react';
import Header from './Header';
import DCRgraph from './DCRgraph';

var dcrTexts = require('../projections/dcrTexts.json');

class ViewR6 extends React.Component {
  constructor(props){
    super(props);
    this.state = {id:dcrTexts['r6']['role'],
                  data:'',
                  execLogs:''
                };
  }

  componentWillMount(){
    try {
      var data = require('../projections/datar6.json');
      var execLogs = require('../projections/execr6.json');

      this.setState({
        'data':data,
        'execLogs':execLogs
      })
    } catch (ex) {
      console.log('not found');
    }
    
  }

  render(){
    return  <div>
             <Header/>
             <DCRgraph id={this.state.id} data={this.state.data} execLogs={this.state.execLogs}/>
            </div>; 
  }
}

export default ViewR6
