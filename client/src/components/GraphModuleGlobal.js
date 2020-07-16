import React from 'react';
import Card from 'react-bootstrap/Card';
import Cytoscape from "cytoscape";
import CytoscapeComponent from 'react-cytoscapejs';
import Header from './Header';
import axios from 'axios';
//import klay from 'cytoscape-klay';
import COSEBilkent from "cytoscape-cose-bilkent";
// import dagre from 'cytoscape-dagre';
Cytoscape.use(COSEBilkent);
//Cytoscape.use(klay);
// Cytoscape.use(dagre);

var node_style = require('../style/nodeStyle.json')
var edge_style = require('../style/edgeStyle.json')
var cyto_style = require('../style/cytoStyle.json')
var dataGlobal = require('../projections/dataGlobal.json')

class GraphModuleGlobal extends React.Component {
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

    this.cy.fit();

    axios.get(`http://localhost:5000/process`,     {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .then(res => {
      console.log(res);
    })
   }

  render(){
    const layout = cyto_style['layoutCose'];
    const style = cyto_style['style'];
    const stylesheet = node_style.concat(edge_style)

    return  <div>
             <Header/>
              <Card id="global" style={{width: '95%', height:'70%','marginTop':'3vh'}}>
                <Card.Header as="p" style= {{color:'white', 'backgroundColor': 'red', 'fontSize': '10pt', 'fontWeight': 200, padding: '2ex 1ex'}}>
                  {this.state.global}</Card.Header>
                <Card.Body>
                  <CytoscapeComponent elements={dataGlobal} 
                                        stylesheet={stylesheet} 
                                        cy={(cy) => {this.cy = cy}}
//                                        layout={layout} 
                                        style={style} />    
                </Card.Body>
              </Card>

            </div>; 
  }
}

export default GraphModuleGlobal
