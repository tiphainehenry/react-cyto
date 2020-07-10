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
var execLogs = require('../projections/execChoreo.json')

import DCReum from "../contracts/DCReum.json";
import getWeb3 from "../getWeb3";

class GraphModuleChoreography extends React.Component {

  constructor(props){
    super(props);
    this.state = {text:null,
                  toBeDisp:'', 
                  global: 'Global DCR to project',
                  choreo:'Public Projection', 
                  r1:'Florist Projection',
                  r2:'Driver Projection',
                  r3:'Customer Projection',
                  nameClicked:'',
                  execLogs: execLogs, 
                  web3: null,
                  accounts: null,
                  contract: null
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
  

   componentDidMount = async () => {
    try {  
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = DCReum.networks[networkId];
      const instance = new web3.eth.Contract(
        DCReum.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
      console.log(accounts)
      console.log(instance)
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }

    this.cy.fit();
    this.setUpListeners();

  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    // await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.0
    // const response = await contract.methods.get().call();

    // Update state with the result.
    // this.setState({ storageValue: response });
  };



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

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

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
              <ExecLogger  execLogs = {this.state.execLogs}/>

            </div>; 
  }
}

export default GraphModuleChoreography
