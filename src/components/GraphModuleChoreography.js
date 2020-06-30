import React from 'react';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/Card';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

import Cytoscape from "cytoscape";
import CytoscapeComponent from 'react-cytoscapejs';
import Header from './Header';
import axios from 'axios';
//import klay from 'cytoscape-klay';
//import COSEBilkent from "cytoscape-cose-bilkent";
import dagre from 'cytoscape-dagre';
Cytoscape.use(dagre);

var node_style = require('../style/nodeStyle.json')
var edge_style = require('../style/edgeStyle.json')
var cyto_style = require('../style/cytoStyle.json')
var dataChoreo = require('../resources/dataChoreo.json')

class GraphModuleChoreography extends React.Component {
  constructor(props){
    super(props);
    this.state = {text:null,
                  toBeDisp:'', 
                  global: 'Global DCR to project',
                  choreo:'Choreography Projection', 
                  r1:'Florist Projection',
                  r2:'Driver Projection',
                  r3:'Customer Projection'
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
    const layout = cyto_style['layout'];
    const style = cyto_style['style'];
    const stylesheet = node_style.concat(edge_style)

    return  <div>
              <Header/>

              <Card id="choreo" style={{width: '95%', height:'70%','margin-top':'3vh'}}>
                <Card.Header as="p" style= {{color:'white', 'background-color': '#00881d', 'font-size': '10pt', 'font-weight': 200, padding: '2ex 1ex'}}>
                  {this.state.choreo}</Card.Header>
                <Card.Body>
                  <CytoscapeComponent elements={dataChoreo} 
                                        stylesheet={stylesheet} 
                                        layout={layout} 
                                        style={style} />    
                </Card.Body>
              </Card>

            </div>; 
  }
}

export default GraphModuleChoreography
