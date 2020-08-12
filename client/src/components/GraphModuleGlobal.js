import React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Cytoscape from "cytoscape";
import CytoscapeComponent from 'react-cytoscapejs';
import Header from './Header';
import axios from 'axios';
import SimpleDCReum from "../contracts/SimpleDCReum.json";
import getWeb3 from "../getWeb3";


var node_style = require('../style/nodeStyle.json')
var edge_style = require('../style/edgeStyle.json')
var cyto_style = require('../style/cytoStyle.json')
var dataGlobal = require('../projections/dataGlobal.json')

var vectChoreo = require('../projections/vectChoreo.json')

class GraphModuleGlobal extends React.Component {
  constructor(props){
    super(props);
    this.state = {text:null,
                  toBeDisp:'', 
                  global: 'Global DCR to project',
                  choreo:'Choreography Projection', 
                  r1:'Florist Projection',
                  r2:'Driver Projection',
                  r3:'Customer Projection',
                  web3: null,
                  accounts: null,
                  contract: null, 
                  includedStates: vectChoreo['fullMarkings']['included'], 
                  executedStates: vectChoreo['fullMarkings']['executed'], 
                  pendingStates:  vectChoreo['fullMarkings']['pending'],
                  includesTo: vectChoreo['fullRelations']['include'],
                  excludesTo: vectChoreo['fullRelations']['exclude'],
                  responsesTo: vectChoreo['fullRelations']['response'],
                  conditionsFrom: vectChoreo['fullRelations']['condition'],
                  milestonesFrom: vectChoreo['fullRelations']['milestone'],
                  wkState: 'Create Global Workflow OnChain'
                };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCreateWkf = this.handleCreateWkf.bind(this);

  }

  handleChange(event) {this.setState({toBeDisp: event.target.value});  }

  handleSubmit(event) {
    alert('Role projection to be displayed: ' + this.state.role);

    this.setState({role: this.state.toBeDisp});
    event.preventDefault();
  }
  
  handleCreateWkf = async () => {
    alert('Creating Workflow onChain');

    const { accounts, contract } = this.state;

    //alert(vectChoreo['fullRelations']['include'].toString().split(","));

    const includesTo = this.state.includesTo.toString().split(",");
    const excludesTo = this.state.excludesTo.toString().split(",");
    const responsesTo = this.state.responsesTo.toString().split(",");
    const conditionsFrom = this.state.conditionsFrom.toString().split(",");
    const milestonesFrom = this.state.milestonesFrom.toString().split(",");

    try{

      await contract.methods.createWorkflow(
            this.state.includedStates,
            this.state.executedStates,
            this.state.pendingStates,
            includesTo,
            excludesTo,
            responsesTo,
            conditionsFrom,
            milestonesFrom        
        ).send({ from: accounts[0] });

      // Get the value from the contract.
      // const lgth = await contract.methods.getWkfLength().call();
      this.setState({wkState:'Public Workflow Onchain !'});
    }
    catch (err) {
      window.alert(err);  
      console.log("web3.eth.handleRevert =", web3.eth.handleRevert);
      const msg= 'BC exec - rejected - '+err;
      this.setState({bcRes:msg});
      this.setState({wkState:'Create Global Workflow OnChain'});
    }

  }

  componentDidMount= async () => {

    this.cy.fit();
    try {  
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleDCReum.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleDCReum.abi,
        deployedNetwork && deployedNetwork.address,
      );

      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    };

    axios.get(`http://localhost:5000/process`,     {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .then(res => {
      console.log(res);
    })
   }

  render(){
    const style = cyto_style['style'];
    const stylesheet = node_style.concat(edge_style)

    return  <div>
             <Header/>

             <Card style={{width: '95%', height:'70%','marginTop':'3vh', 'borderColor':'white'}}>
             <p>Welcome to DCRPortal, a toy portal to monitor a flower shipment in a decentralized fashion !</p>
             <p>Before starting, instanciate the public chunk of the workflow onchain by clicking on the blue button (below). </p>
             <p>To execute the process, you can then navigate between the different role projections via the header. </p>
             </Card>
              <Card id="global" style={{width: '95%', height:'70%','marginTop':'3vh'}}>
                <Card.Header as="p" style= {{color:'black', 'backgroundColor': 'white', 'fontSize': '10pt', 'fontWeight': 200, padding: '2ex 1ex'}}>
                  {this.state.global}</Card.Header>
                <Card.Body>
                  <CytoscapeComponent elements={dataGlobal} 
                                        stylesheet={stylesheet} 
                                        cy={(cy) => {this.cy = cy}}
                                        style={style} />    
                  <Button onClick={this.handleCreateWkf}>{this.state.wkState}</Button>
                </Card.Body>
                
              </Card>

            </div>; 
  }
}

export default GraphModuleGlobal
