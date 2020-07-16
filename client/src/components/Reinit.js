import React from 'react';
import Button from 'react-bootstrap/Button';
import Cytoscape from "cytoscape";
import CytoscapeComponent from 'react-cytoscapejs';
import axios from 'axios';
import ExecLogger from './execLogger'
import COSEBilkent from "cytoscape-cose-bilkent";
Cytoscape.use(COSEBilkent);

class Reinit extends React.Component {
  constructor(props){
    super(props);
    this.state = {text:null,
                  toBeDisp:'', 
                  global: 'Global DCR to project',
                  choreo:'Choreography Projection', 
                  r1:'Florist  Projection',
                  r2:'Driver Projection',
                  r3:'Customer Projection',
                  idClicked:'',
                  nameClicked:'',
                  execlogs: []
                };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    event.preventDefault();
    axios.post(`http://localhost:5000/reinit`, 'reinit')
  }

  render(){
    return<div style={{ display: "flex",justifyContent: "center",
    alignItems: "center",}}>
              <Button onClick={this.handleClick}
              style= {{color:'white', 'backgroundColor': '#7c9d84', 'border-color':'#7c9d84', 'fontSize': '10pt', 'fontWeight': 200}}
              >Reinitialise Process</Button> 
          </div>; 
  }
}

export default Reinit
