import React from 'react';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/Card';
import Cytoscape from "cytoscape";
import CytoscapeComponent from 'react-cytoscapejs';
import Header from './Header';
import axios from 'axios';
import klay from 'cytoscape-klay';
import COSEBilkent from "cytoscape-cose-bilkent";
//Cytoscape.use(COSEBilkent);
Cytoscape.use(klay);

var node_style = require('../resources/nodeStyle.json')
var edge_style = require('../resources/edgeStyle.json')

var dataChoreo = require('../resources/dataChoreo.json')
var dataR1 = require('../resources/dataCustomer.json')
var dataR2 = require('../resources/dataBlockchain.json')
var dataR3 = require('../resources/dataRental.json')

class GraphModule extends React.Component {
  constructor(props){
    super(props);
    this.state = {text:null,
                  toBeDisp:'', 
                  choreo:'Choreography Projection', 
                  r1:'Customer Projection',
                  r2:'Blockchain Projection',
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
    //const layout = { name: 'cose-bilkent' };
    const layout = {name: 'klay'};

    const style = { width: '100%', 
                    height: '60vh', 
                    margin: '0 auto', /* Added */
                  }
    
    const stylesheet = node_style.concat(edge_style)

    return  <div>
              <Header/>
              <Card style={{width: '95%', height:'70%','margin-top':'3vh'}}>
                <Card.Header as="p" style= {{color:'white', 'background-color': '#00881d', 'font-size': '10pt', 'font-weight': 200, padding: '2ex 1ex'}}>
                  {this.state.choreo}</Card.Header>
                <Card.Body>
                  <CytoscapeComponent elements={dataChoreo} 
                                        stylesheet={stylesheet} 
                                        layout={layout} 
                                        style={style} />    
                </Card.Body>
              </Card>

              <Card style={{width: '95%', height:'70%','margin-top':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'background-color': '#006588', 'font-size': '10pt', 'font-weight': 200, padding: '2ex 1ex'}}>
                  {this.state.r1}</Card.Header>
                <Card.Body >
                  <CytoscapeComponent elements={dataR1} 
                                        stylesheet={stylesheet} 
                                        layout={layout} 
                                        style={style} />    
                </Card.Body>
              </Card>

              <Card style={{width: '95%', height:'70%'}}>
              <Card.Header as="p" style= {{color:'white', 'background-color': '#006588', 'font-size': '10pt', 'font-weight': 200, padding: '2ex 1ex'}}>
                {this.state.r2}</Card.Header>
                <Card.Body >
                  <CytoscapeComponent elements={dataR2} 
                                        stylesheet={stylesheet} 
                                        layout={layout} 
                                        style={style} />    
                </Card.Body>
              </Card>

              <Card style={{width: '95%', height:'70%','margin-bottom':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'background-color': '#006588', 'font-size': '10pt', 'font-weight': 200, padding: '2ex 1ex'}}>
                {this.state.r3}</Card.Header>
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
