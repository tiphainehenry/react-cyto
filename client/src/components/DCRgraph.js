import React, {useState} from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Cytoscape from "cytoscape";
import CytoscapeComponent from 'react-cytoscapejs';
import axios from 'axios';
import ExecLogger from './execLogger';
import COSEBilkent from "cytoscape-cose-bilkent";
import DCRpublicEngine from "../contracts/DCRpublicEngine.json";
import SimpleDCReum from "../contracts/SimpleDCReum.json";
import getWeb3 from "../getWeb3";

Cytoscape.use(COSEBilkent);
var node_style = require('../style/nodeStyle.json')
var edge_style = require('../style/edgeStyle.json')
var cyto_style = require('../style/cytoStyle.json')

var vectChoreo = require('../projections/vectChoreo.json')

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
                  DCRPublicId:'',
                  nameClicked:'',
                  web3: null,
                  accounts: null,
                  contract: null, 
                  execStatus:'',
                  bcRes:'',
                  storageValue:0,
                  includedStates: vectChoreo['fullMarkings']['included'], 
                  executedStates: vectChoreo['fullMarkings']['executed'], 
                  pendingStates:  vectChoreo['fullMarkings']['pending'],
                  includesTo: vectChoreo['fullRelations']['include'],
                  excludesTo: vectChoreo['fullRelations']['exclude'],
                  responsesTo: vectChoreo['fullRelations']['response'],
                  conditionsFrom: vectChoreo['fullRelations']['condition'],
                  milestonesFrom: vectChoreo['fullRelations']['milestone']
                };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleCreateWkf = this.handleCreateWkf.bind(this);

    }

  handleChange(event) {this.setState({toBeDisp: event.target.value});}

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
      const lgth = await contract.methods.getWkfLength().call();
      alert('Workflow length' + lgth);

    }
    catch (err) {
      window.alert(err);  
      console.log("web3.eth.handleRevert =", web3.eth.handleRevert);
      const msg= 'BC exec - rejected - '+err;
      this.setState({bcRes:msg});
    }

  }


  componentDidMount = async () => {
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

        //const networkId = await web3.eth.net.getId();
        //const deployedNetwork = DCRpublicEngine.networks[networkId];

        //const storageDeployedNetwork = SimpleStorage.networks[networkId];
   
        // const instance = new web3.eth.Contract(
        //  DCRpublicEngine.abi,
        //  deployedNetwork && deployedNetwork.address,
        //);  

        //        const storageInstance = new web3.eth.Contract(
        //          SimpleStorage.abi,
        //          storageDeployedNetwork && storageDeployedNetwork.address,
        //);  

        this.setState({ web3, accounts, contract: instance });
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      };
  
      this.setUpListeners();
  
    };
  

    runBCCheck = async () => {
      window.alert('Task  ['+this.state.idClicked+'] is public... Proceeding to blockchain check');  

      const { accounts, contract } = this.state;
  
      // Step1: Fetch corresponding BC id.
      const activityNames = vectChoreo['activityNames'];
      const isElem = (element) => element == this.state.idClicked;
      const indexClicked = activityNames.findIndex(isElem);

      // Step2: Execute transaction.
      try{

        await contract.methods.checkCliquedIndex(indexClicked).send({ from: accounts[0] });
  
        // Get the value from the contract.
        const execStatus = await contract.methods.getStatus().call();
        // Update state with the result.
        if (execStatus == 1) {
          this.setState({ bcRes: 'executed' });
        }
          else {
          this.setState({ bcRes: 'rejected' });
        }
      }
      catch (err) {
        window.alert(err);  
        console.log("web3.eth.handleRevert =", web3.eth.handleRevert);
        const msg= 'BC exec - rejected - '+err;
        this.setState({bcRes:msg});
      }

      var headers = {
        "Access-Control-Allow-Origin": "*",
      };

      axios.post(`http://localhost:5000/BCupdate`, 
      {idClicked:this.state.idClicked, projId:this.props.id, execStatus:this.state.bcRes},
      {"headers" : headers}
    );      

    };


   setUpListeners = () => {
      this.cy.on('click', 'node', (event) => {
      //getClikedNode
      console.log(event.target['_private']['data']);
      this.setState({nameClicked:event.target['_private']['data']['name']});
      this.setState({idClicked:event.target['_private']['data']['id']});
    
      //updateGraphMarkings
      event.preventDefault();
      const idClicked = this.state.idClicked;
      var headers = {
        "Access-Control-Allow-Origin": "*",
      };
      axios.post(`http://localhost:5000/process`, 
        {idClicked, projId:this.props.id},
        {"headers" : headers}
      ).then( 
        (response) => { 
            var result = response.data; 

            if (result.includes('BC')){
              //check BC execution
              this.runBCCheck();
            }
        }, 
        (error) => { 
            console.log(error); 
        } 
    ); 

    })
  }

  render(){
    // const layout = cyto_style['layoutCose'];
    const style = cyto_style['style'];
    const stylesheet = node_style.concat(edge_style)

    return  <div>
              <Card style={{width: '95%', height:'90%','marginTop':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'backgroundColor': '#006588', 'fontSize': '10pt', 'fontWeight': 200, padding: '2ex 1ex'}}>
                  Instanciate Global Workflow</Card.Header>
                <Card.Body><Button onClick={this.handleCreateWkf}>Create Global Workflow OnChain</Button></Card.Body>
              </Card>

              <Card style={{width: '95%', height:'90%','marginTop':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'backgroundColor': '#006588', 'fontSize': '10pt', 'fontWeight': 200, padding: '2ex 1ex'}}>
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
