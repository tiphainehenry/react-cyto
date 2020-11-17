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

                  wkState: '... waiting for Smart Contract instanciation ...',

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

        
      axios.post(`http://localhost:5000/reinit`, 'reinit');
      // window.location.reload(false);

    }
    catch (err) {
      window.alert(err);  
      this.setState({wkState:'Create Global Workflow OnChain'});
    }
    
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

      // Checking if contract already populated
      const {contract} = this.state;

      const inclVector = await contract.methods.getIncluded().call();

      if (inclVector.length>0){
        this.setState({wkState:'Public Workflow onchain. Reset?'  });
      }
      else{
        this.setState({wkState:'Create Global Workflow OnChain.'})
      }  

    } catch (error) {
        alert(
          `Failed to load web3, accounts, or contract. 
          Check console for details.
          Tip: Webpage should be connected to the Ropsten network via Metamask (https://metamask.io/).`,
        );
        console.error(error);
    };
  }


  render(){
    const layout = cyto_style['layoutCose'];
    const style = cyto_style['style'];
    const stylesheet = node_style.concat(edge_style)
    
    return  <div>
            <h5>Step 2</h5>
             <p>Instanciate the public chunk of the workflow onchain by clicking on the button below. </p>
             <p>Make sure you have Metamask installed on your favorite browser. The smart contract is deployed on the Ropsten network.</p>

              <Button class="btn btn-primary my-2 my-sm-0"  onClick={this.handleCreateWkf}>{this.state.wkState}</Button>


              <CytoscapeComponent elements={data} 
                                        stylesheet={stylesheet} 
                                        layout={layout} 
                                        style={style} 
                                        cy={(cy) => {this.cy = cy}}
                                        boxSelectionEnabled={false}
                                        />    
            </div>; 
  }
}

export default GMGlobal
