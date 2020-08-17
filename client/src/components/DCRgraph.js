import React, {useState} from 'react';
import Card from 'react-bootstrap/Card';
import axios from 'axios';
import ExecLogger from './execLogger';

import SimpleDCReum from '../contracts/SimpleDCReum.json';
import getWeb3 from '../getWeb3';

import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';

// import COSEBilkent from 'cytoscape-cose-bilkent';
// Cytoscape.use(COSEBilkent);
var node_style = require('../style/nodeStyle.json');
var edge_style = require('../style/edgeStyle.json');
var cyto_style = require('../style/cytoStyle.json');


class DCRgraph extends React.Component {
  constructor(props){
    super(props);
    this.state = {
                  idClicked:'',
                  indexClicked:'',
                  nameClicked:'',
                  activityNames:["e2","e5","e8","e9","e10","e11","e14","CallShipper","ReturnTruck","SettleCommand"],
                  activityNames_s:["e2s","e5s","e8s","e9s","e10s","e11s","e14s","CallShipper","ReturnTruck","SettleCommand"],
                  activityNames_r:["e2r","e5r","e8r","e9r","e10r","e11r","e14r","CallShipper","ReturnTruck","SettleCommand"],

                  web3: null,
                  accounts: null,
                  contract: null, 

                  bcRes:'',

                  incl:'',
                  exec:'',
                  pend:'',
                  lg_activityNames:''
                };
    }

  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {

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

    const { accounts, contract } = this.state;

    // checking public workflow: 
    // print public vectors and debug the functions

    const inclVector = await contract.methods.getIncluded().call();
    const execVector = await contract.methods.getExecuted().call();
    const pendVector = await contract.methods.getPending().call();

    this.setState({
      lg_activityNames:'Tasks: ' + this.state.activityNames.join(),
      incl:'Included vector: ' + inclVector,
      exec:'Executed vector: ' + execVector,
      pend:'Pending vector:  ' + pendVector,
  });

  }

  componentDidMount = async () => {
      this.cy.fit();
      this.setUpListeners();
    };
  

    runBCCheck = async () => {
      const { accounts, contract } = this.state;

      // checking public workflow: 
      window.alert('Task  ['+this.state.idClicked+'] is public... Proceeding to blockchain check');  

      // Step1: Fetch corresponding BC id.
      var lastChar = this.state.idClicked.charAt(this.state.idClicked.length-1);
      var activities = []
      switch(lastChar){
        case 's':
          activities = this.state.activityNames_s;
          break;
        case 'r':
          activities = this.state.activityNames_r;
          break;
        default:
          activities = this.state.activityNames;
      }
      const isElem = (element) => element.includes(this.state.idClicked);
      const indexClicked = activities.findIndex(isElem);
      this.setState({indexClicked:indexClicked});


      window.alert('BC id to examine: '+this.state.indexClicked);



      // Step2: Execute transaction.
      try{

        await contract.methods.checkCliquedIndex(this.state.indexClicked).send({ from: accounts[0] });
  
        // Get the value from the contract.
        const output =  await contract.methods.getCanExecuteCheck().call();

        switch(output) {
          case 1:
            window.alert('Task not included');
            this.setState({ bcRes: 'BC exec - rejected - taskNotIncluded' });
            break;
          case 2:
            window.alert('Conditions not fulfilled');
            this.setState({ bcRes: 'BC exec - rejected - conditionsNotFulfilled' });
            break;
          case 3:
            window.alert('Milestones not fulfilled');
            this.setState({ bcRes: 'BC exec - rejected - milestonesNotFulfilled' });
            break;
          case 0:
            window.alert('Task executable');
            this.setState({ bcRes: 'executed' });
            break;          
          default:
            this.setState({ bcRes: 'BC exec - rejected - Did not evaluate the task' });
        }


      }
      catch (err) {
        console.log("web3.eth.handleRevert =", web3.eth.handleRevert);
        const msg= 'BC exec - rejected - Metamask issue - Please try again (Higher gas fees, contract recompilation, or metamask reinstallation)';
        window.alert(msg);  
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
    const stylesheet = node_style.concat(edge_style);

    return  <div>
              <Card style={{width: '95%', height:'90%','marginTop':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'backgroundColor': '#006588', 'fontSize': '10pt', 'fontWeight': 200, padding: '2ex 1ex'}}>
                  Public projection instance marking vectors</Card.Header>
                <Card.Body >
                  <p>{this.state.lg_activityNames}</p>
                  <p>{this.state.incl}</p>
                  <p>{this.state.pend}</p>
                  <p>{this.state.exec}</p>
                </Card.Body>
              </Card>
              <Card style={{width: '95%', height:'90%','marginTop':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'backgroundColor': '#006588', 'fontSize': '10pt', 'fontWeight': 200, padding: '2ex 1ex'}}>
                  {this.props.id}</Card.Header>
                <Card.Body >
                  <CytoscapeComponent elements={this.props.data} 
                                        stylesheet={stylesheet} 
                                        // layout={layout} 
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
