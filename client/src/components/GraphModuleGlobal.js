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
    this.state = {
                  web3: null,
                  accounts: null,
                  contract: null, 

                  wkState: '... loading ...',

                  includedStates: vectChoreo['fullMarkings']['included'], 
                  executedStates: vectChoreo['fullMarkings']['executed'], 
                  pendingStates:  vectChoreo['fullMarkings']['pending'],
                  includesTo: vectChoreo['fullRelations']['include'],
                  excludesTo: vectChoreo['fullRelations']['exclude'],
                  responsesTo: vectChoreo['fullRelations']['response'],
                  conditionsFrom: vectChoreo['fullRelations']['condition'],
                  milestonesFrom: vectChoreo['fullRelations']['milestone'],

                };
    this.handleCreateWkf = this.handleCreateWkf.bind(this);
  }
  
  handleCreateWkf = async () => {
    alert('Creating Workflow onChain');

    const { accounts, contract } = this.state;

    try{

      await contract.methods.createWorkflow(
            this.state.includedStates,
            this.state.executedStates,
            this.state.pendingStates,
            this.state.includesTo,
            this.state.excludesTo,
            this.state.responsesTo,
            this.state.conditionsFrom,
            this.state.milestonesFrom        
        ).send({ from: accounts[0] });
    
    }
    catch (err) {
      window.alert(err);  
      console.log("web3.eth.handleRevert =", web3.eth.handleRevert);
      this.setState({wkState:'Create Global Workflow OnChain'});
    }

    axios.post(`http://localhost:5000/reinit`, 'reinit');
    // window.location.reload(false);
    
  }

  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {

    try {  
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleDCReum.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleDCReum.abi,
        deployedNetwork && deployedNetwork.address,
      );

      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
    };

    // Checking if contract already populated
    const {contract} = this.state;

    const inclVector = await contract.methods.getIncluded().call();

    if (inclVector.length>0){
      this.setState({wkState:'Public Workflow onchain. Reset?'  });
    }
    else{
      this.setState({wkState:'Create Global Workflow OnChain.'})
    }
  }


  componentDidMount= async () => {
    this.cy.fit();
   }

  render(){
    const style = cyto_style['style'];
    const stylesheet = node_style.concat(edge_style)
    
    return  <div>
             <Header/>

             <Card style={{width: '95%', height:'70%','marginTop':'3vh', 'borderColor':'white'}}>
             <p>Welcome to DCRPortal, a toy portal to monitor a flower shipment in a decentralized fashion !</p>
             <p>Before starting, instanciate the public chunk of the workflow onchain by clicking on the blue button (below). </p>
             <p>To execute the process, navigate between the different role projections accessible via the header. </p>

              <Button style = {{width:'20%'}} onClick={this.handleCreateWkf}>{this.state.wkState}</Button>

             </Card>
              <Card id="global" style={{width: '95%', height:'70%','marginTop':'3vh'}}>
                <Card.Header as="p" style= {{color:'black', 'backgroundColor': 'white', 'fontSize': '10pt', 'fontWeight': 200, padding: '2ex 1ex'}}>
                  {this.state.global}</Card.Header>
                <Card.Body>
                  <CytoscapeComponent elements={dataGlobal} 
                                        stylesheet={stylesheet} 
                                        cy={(cy) => {this.cy = cy}}
                                        style={style} />    
                </Card.Body>
                
              </Card>
            </div>; 
  }
}

export default GraphModuleGlobal
