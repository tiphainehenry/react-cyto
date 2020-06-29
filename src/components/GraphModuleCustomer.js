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

var dataR3 = require('../resources/dataCustomer.json')

class GraphModuleCustomer extends React.Component {
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
                <Navbar.Brand href="/">DCR Portal</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="mr-auto">
                    <Nav.Link href="/choreography">Choreography</Nav.Link>
                    <NavDropdown title="Role Projections" id="collasible-nav-dropdown">
                      <NavDropdown.Item href="/florist">{this.state.r1}</NavDropdown.Item>
                      <NavDropdown.Item href="/driver">{this.state.r2}</NavDropdown.Item>
                      <NavDropdown.Item href="/customer">{this.state.r3}</NavDropdown.Item>
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

export default GraphModuleCustomer
