import React from 'react';
import Card from 'react-bootstrap/Card';
import Cytoscape from "cytoscape";
import CytoscapeComponent from 'react-cytoscapejs';
import axios from 'axios';
import ExecLogger from './execLogger';
import COSEBilkent from "cytoscape-cose-bilkent";
Cytoscape.use(COSEBilkent);

var node_style = require('../style/nodeStyle.json')
var edge_style = require('../style/edgeStyle.json')
var cyto_style = require('../style/cytoStyle.json')

class DCRgraph extends React.Component {
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
                  nameClicked:''
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
    this.setUpListeners();
  }

   setUpListeners = () => {
    this.cy.on('click', 'node', (event) => {
 
      //getClikedNode
      console.log(event.target['_private']['data']);

      this.setState({nameClicked:event.target['_private']['data']['name']});
      this.setState({idClicked:event.target['_private']['data']['id']});

      // this.setState({execlogs:this.state.execlogs.concat({
        // 'id':this.state.idClicked, 
        // 'name':this.state.nameClicked,
        // 'timestamp': new Date().toISOString().substr(0, 19).replace('T', ' ')
      // })});
    
    //updateGraphMarkings
    event.preventDefault()
    const idClicked = this.state.idClicked;
    axios.post(`http://localhost:5000/process`, 
      {idClicked, projId:this.props.id}
    )
    .then(res => {
        console.log(res);
        console.log(res.data);
    })
    
    });
  }

  render(){
    // const layout = cyto_style['layoutCose'];
    const style = cyto_style['style'];
    const stylesheet = node_style.concat(edge_style)

    return  <div>
              <Card style={{width: '95%', height:'90%','margin-top':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'background-color': '#006588', 'font-size': '10pt', 'font-weight': 200, padding: '2ex 1ex'}}>
                  {this.props.id}</Card.Header>
                <Card.Body >
                  <CytoscapeComponent elements={this.props.data} 
                                        stylesheet={stylesheet} 
//                                      layout={layout} 
                                        style={style} 
                                        cy={(cy) => {this.cy = cy}}
                                        boxSelectionEnabled={false}
                                        />    
                </Card.Body>
              </Card>
              <ExecLogger  execLogs = {this.props.execLogs}/>
            </div>; 
  }
}

export default DCRgraph
