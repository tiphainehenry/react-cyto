import React from 'react';
import Card from 'react-bootstrap/Card'
import CytoscapeComponent from 'react-cytoscapejs';
import Header from './Header';
import axios from 'axios'


var node_style = require('../resources/nodeStyle.json')
var edge_style = require('../resources/edgeStyle.json')

var dataChoreo = require('../resources/dataChoreo.json')
var dataR1 = require('../resources/dataBlockchain.json')
var dataR2 = require('../resources/dataCustomer.json')
var dataR3 = require('../resources/dataRental.json')

class GraphModule extends React.Component {
  constructor(props){
    super(props);
    this.state = {text:null,
                  toBeDisp:'', 
                  choreo:'Choreography Projection', 
                  r1:'Blockchain Projection',
                  r2:'Customer Projection',
                  r3:'Rental Projection'
                };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {this.setState({toBeDisp: event.target.value});  }

  handleSubmit(event) {
    alert('Role projection to be displayed: ' + this.state.role);

    this.setState({role: this.state.toBeDisp});
    event.preventDefault();
  }
  
  componentDidMount() {

    axios.get(`http://localhost:5000/process`,     {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .then(res => {
      console.log(res);

    })
   }


  render(){
    
    const layout = {'name': 'grid'};

    const style = { width: '90vh', 
                    height: '70vh', 
                    'box-shadow': '0 2px 5px 0 rgba(0, 0, 0, 0.16)'
                  }
    
    const stylesheet = node_style.concat(edge_style)
    return  <div>
              <Header/>
              <Card style={{ width: '100vh', height:'90vh', 'margin-top':'3vh', 'margin-left':'3vh','margin-bottom':'3vh' }}>
                <Card.Header as="h5">{this.state.choreo}</Card.Header>
                <Card.Body >
                  <CytoscapeComponent elements={dataChoreo} 
                                        stylesheet={stylesheet} 
                                        layout={layout} 
                                        style={style} />    
                </Card.Body>
              </Card>

              <Card style={{ width: '100vh', height:'90vh', 'margin-top':'3vh', 'margin-left':'3vh','margin-bottom':'3vh' }}>
                <Card.Header as="h5">{this.state.r1}</Card.Header>
                <Card.Body >
                  <CytoscapeComponent elements={dataR1} 
                                        stylesheet={stylesheet} 
                                        layout={layout} 
                                        style={style} />    
                </Card.Body>
              </Card>

              <Card style={{ width: '100vh', height:'90vh', 'margin-top':'3vh', 'margin-left':'3vh','margin-bottom':'3vh' }}>
                <Card.Header as="h5">{this.state.r2}</Card.Header>
                <Card.Body >
                  <CytoscapeComponent elements={dataR2} 
                                        stylesheet={stylesheet} 
                                        layout={layout} 
                                        style={style} />    
                </Card.Body>
              </Card>

              <Card style={{ width: '100vh', height:'90vh', 'margin-top':'3vh', 'margin-left':'3vh','margin-bottom':'3vh' }}>
                <Card.Header as="h5">{this.state.r3}</Card.Header>
                <Card.Body >
                  <CytoscapeComponent elements={dataR3} 
                                        stylesheet={stylesheet} 
                                        layout={layout} 
                                        style={style} />    
                </Card.Body>
              </Card>

            </div>;
  }
}

export default GraphModule
