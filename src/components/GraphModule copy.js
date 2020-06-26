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
//Cytoscape.use(COSEBilkent);
//Cytoscape.use(klay);
Cytoscape.use(dagre);

var node_style = require('../resources/nodeStyle.json')
var edge_style = require('../resources/edgeStyle.json')

var dataGlobal = require('../resources/dataGlobal.json')
var dataChoreo = require('../resources/dataChoreo.json')
var dataR1 = require('../resources/dataCustomer_ok.json')
var dataR2 = require('../resources/dataBlockchain_ok.json')
var dataR3 = require('../resources/dataRental_ok.json')

class GraphModule extends React.Component {
  constructor(props){
    super(props);
    this.state = {text:null,
                  toBeDisp:'', 
                  global: 'Global DCR to project',
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
//    const layout = {name: 'breadthfirst',
//                    spacingFactor: 1.5};
     const layout = {name: 'dagre',
     rankDir: 'LR',
     nodeDimensionsIncludeLabels: true,
     spacingFactor: 1.2,
     edgeSep: 2,
     minLen: function( edge ){ return 0; },
    
    };

    const style = { width: '100%', 
                    height: '60vh', 
                    margin: '0 auto', /* Added */
                  }
    
    const stylesheet = node_style.concat(edge_style)

    return  <div>
              <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" sticky="top">
                <Navbar.Brand href="#home">DCR Portal</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="mr-auto">
                    <Nav.Link href="#global">{this.state.global}</Nav.Link>
                    <Nav.Link href="#choreo">{this.state.choreo}</Nav.Link>

                    <NavDropdown title="Role Projections" id="collasible-nav-dropdown">
                      <NavDropdown.Item href="#r1">{this.state.r1}</NavDropdown.Item>
                      <NavDropdown.Item href="#r2">{this.state.r2}</NavDropdown.Item>
                      <NavDropdown.Item href="#r3">{this.state.r3}</NavDropdown.Item>
                    </NavDropdown>
                  </Nav>
                  <Nav pullRight>
                    
                    <NavDropdown title="Constraints Legend" id="collasible-nav-dropdown">
                      <NavDropdown.Item style={{"font-size":'16px'}}>Post-execution</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#29A81A", "font-size":'12px'}}> -- Include</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#FF0000", "font-size":'12px'}}> -- Exclude</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#1E90FF", "font-size":'12px'}}> -- Response</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item style={{"font-size":'16px'}}>Pre-execution</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#FFA500", "font-size":'12px'}}> -- Condition</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#BC1AF2", "font-size":'12px'}}> -- Milestone</NavDropdown.Item>
                    </NavDropdown>
                  </Nav>
                </Navbar.Collapse>
              </Navbar>


              <Card id="global" style={{width: '95%', height:'70%','margin-top':'3vh'}}>
                <Card.Header as="p" style= {{color:'white', 'background-color': 'red', 'font-size': '10pt', 'font-weight': 200, padding: '2ex 1ex'}}>
                  {this.state.global}</Card.Header>
                <Card.Body>
                  <CytoscapeComponent elements={dataGlobal} 
                                        stylesheet={stylesheet} 
                                        layout={layout} 
                                        style={style} />    
                </Card.Body>
              </Card>

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

              <Card id="r1" style={{width: '95%', height:'70%','margin-top':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'background-color': '#006588', 'font-size': '10pt', 'font-weight': 200, padding: '2ex 1ex'}}>
                  {this.state.r1}</Card.Header>
                <Card.Body >
                  <CytoscapeComponent elements={dataR1} 
                                        stylesheet={stylesheet} 
                                        layout={layout} 
                                        style={style} />    
                </Card.Body>
              </Card>

              <Card id="r2" style={{width: '95%', height:'70%'}}>
              <Card.Header as="p" style= {{color:'white', 'background-color': '#006588', 'font-size': '10pt', 'font-weight': 200, padding: '2ex 1ex'}}>
                {this.state.r2}</Card.Header>
                <Card.Body >
                  <CytoscapeComponent elements={dataR2} 
                                        stylesheet={stylesheet} 
                                        layout={layout} 
                                        style={style} />    
                </Card.Body>
              </Card>

              <Card id="r3" style={{width: '95%', height:'70%','margin-bottom':'3vh'}}>
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
