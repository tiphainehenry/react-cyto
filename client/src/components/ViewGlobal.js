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
var data = require('../projections/dataGlobal.json')
var vectPublic = require('../projections/vectPublic.json')

class GMGlobal extends React.Component {
  constructor(props){
    super(props);
    this.state = {
                  web3: null,
                  accounts: null,
                  contract: null, 

                  wkState: '... loading ...',

                  includedStates: vectPublic['fullMarkings']['included'], 
                  executedStates: vectPublic['fullMarkings']['executed'], 
                  pendingStates:  vectPublic['fullMarkings']['pending'],
                  includesTo: vectPublic['fullRelations']['include'],
                  excludesTo: vectPublic['fullRelations']['exclude'],
                  responsesTo: vectPublic['fullRelations']['response'],
                  conditionsFrom: vectPublic['fullRelations']['condition'],
                  milestonesFrom: vectPublic['fullRelations']['milestone']
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
      console.log("web3.eth.handleRevert =", this.state.web3.eth.handleRevert);
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


  render(){
    const layout = cyto_style['layoutCose'];
    const style = cyto_style['style'];
    const stylesheet = node_style.concat(edge_style)
    
    return  <div>
             <Card style={{width: '95%', height:'70%','marginTop':'3vh', 'borderColor':'white'}}>
             <p>Before starting, instanciate the public chunk of the workflow onchain by clicking on the blue button (below). </p>
             <p>To execute the process, navigate between the different role projections accessible via the header. </p>

              <Button style = {{width:'20%', 'backgroundColor':'#f09329', 'border':'none'}} onClick={this.handleCreateWkf}>{this.state.wkState}</Button>


              <CytoscapeComponent elements={data} 
                                        stylesheet={stylesheet} 
                                        layout={layout} 
                                        style={style} 
                                        cy={(cy) => {this.cy = cy}}
                                        boxSelectionEnabled={false}
                                        />    

             </Card>
            </div>; 
  }
}

export default GMGlobal
