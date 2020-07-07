import React from 'react';
import Card from 'react-bootstrap/Card';

import Cytoscape from "cytoscape";
import CytoscapeComponent from 'react-cytoscapejs';
import Header from './Header';
import ExecLogger from './execLogger'
import axios from 'axios';
//import klay from 'cytoscape-klay';
import COSEBilkent from "cytoscape-cose-bilkent";
// import dagre from 'cytoscape-dagre';
Cytoscape.use(COSEBilkent);

var node_style = require('../style/nodeStyle.json')
var edge_style = require('../style/edgeStyle.json')
var cyto_style = require('../style/cytoStyle.json')
var dataChoreo = require('../projections/dataChoreo.json')

class GraphModuleChoreography extends React.Component {
  constructor(props){
    super(props);
    this.state = {text:null,
                  toBeDisp:'', 
                  global: 'Global DCR to project',
                  choreo:'Choreography Projection', 
                  r1:'Florist Projection',
                  r2:'Driver Projection',
                  r3:'Customer Projection',
                  nameClicked:'',
                  execlogs: []
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

    // axios.get(`http://localhost:5000/process`,     {
      // headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    // })
    // .then(res => {
      // console.log(res);
    // });
    this.cy.fit();
    this.setUpListeners();
   }

   setUpListeners = () => {
    this.cy.on('click', 'node', (event) => {
      console.log(event.target['_private']['data']);
      this.setState({nameClicked:event.target['_private']['data']['name']})
      this.setState({execlogs:this.state.execlogs.concat({
        'id':event.target['_private']['data']['id'], 
        'name':this.state.nameClicked,
        'timestamp': new Date().toISOString().substr(0, 19).replace('T', ' ')
    
    })})
    })
  }


  render(){
    const layout = cyto_style['layoutCose'];
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
//                                        layout={layout} 
                                        style={style} 
                                        cy={(cy) => {this.cy = cy}}
                                        boxSelectionEnabled={false}
                                        />    
                </Card.Body>
              </Card>
              <ExecLogger  execlogs = {this.state.execlogs}/>

            </div>; 
  }
}

export default GraphModuleChoreography
