import React, {useState} from 'react';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import ListGroup from 'react-bootstrap/ListGroup'

import axios from 'axios';
import ExecLogger from './execLogger';
import PublicMarkings from './PublicMarkings';

import SimpleDCReum from '../contracts/SimpleDCReum.json';
import getWeb3 from '../getWeb3';

import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';

import COSEBilkent from 'cytoscape-cose-bilkent';
Cytoscape.use(COSEBilkent);
var node_style = require('../style/nodeStyle.json');
var edge_style = require('../style/edgeStyle.json');
var cyto_style = require('../style/cytoStyle.json');

var vectPublic = require('../projections/vectPublic.json');

class DCRgraph extends React.Component {
  constructor(props){
    super(props);
    this.state = {
                  start_timestamp:'',
                  idClicked:'',
                  indexClicked:'',
                  nameClicked:'',
                  activityNames:vectPublic["activityNames"],

                  web3: null,
                  accounts: null,
                  contract: null, 

                  bcRes:'',

                  incl:'',
                  exec:'',
                  pend:'',
                  dataHashes:'',
                  activityData:'', 
                  dataValues:[]
                };
      this.fetchBCid = this.fetchBCid.bind(this);
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
    const hashesVector = await contract.methods.getHashes().call();

    this.setState({
      incl:inclVector,
      exec:execVector,
      pend:pendVector,
      dataHashes:hashesVector,
  });

  }

  componentDidMount = async () => {
      this.cy.fit();
      this.setUpListeners();
    };
  
  fetchBCid() {

    // Step1: Fetch corresponding BC id.
    var lastChar = this.state.idClicked.charAt(this.state.idClicked.length-1);
    console.log(lastChar)

    var activities = []
    switch(lastChar){
      case 's':
        activities = this.state.activityNames["send"];
        break;
      case 'r':
        activities = this.state.activityNames["receive"];
        break;
      default:
        activities = this.state.activityNames["default"];
    }
    const isElem = (element) => element.includes(this.state.idClicked);
    const indexClicked = activities.findIndex(isElem);

    this.setState({indexClicked:indexClicked});

    // window.alert('BC id to examine: '+this.state.indexClicked);
  }

  runBCCheck = async () => {
      const { accounts, contract } = this.state;
      window.alert('Task  ['+this.state.nameClicked+'] is public... Proceeding to blockchain check');  

      // fetch public workflow id
      this.fetchBCid();

      // execute transaction
      
      try{
        var hashData = this.state.web3.utils.fromAscii(this.state.activityData);

        await contract.methods.checkCliquedIndex(this.state.indexClicked, hashData).send({ from: accounts[0] });
  
        // Get the value from the contract.
        const output =  await contract.methods.getCanExecuteCheck().call();
        switch(output) {
          case '1':
            window.alert('Task not included');
            this.setState({ bcRes: 'BC exec - rejected - taskNotIncluded' });
            break;
          case '2':
            window.alert('Conditions not fulfilled');
            this.setState({ bcRes: 'BC exec - rejected - conditionsNotFulfilled' });
            break;
          case '3':
            window.alert('Milestones not fulfilled');
            this.setState({ bcRes: 'BC exec - rejected - milestonesNotFulfilled' });
            break;
          case '0':
            //window.alert('Task executable');
            this.setState({ bcRes: 'executed' });
            break;          
          default:
            this.setState({ bcRes: 'BC exec - rejected - Did not evaluate the task' });
        }

      }
      catch (err) {
        console.log("web3.eth.handleRevert =", this.state.web3.eth.handleRevert);
        const msg= 'BC exec - rejected - Metamask issue - Please try again (Higher gas fees, contract recompilation, or metamask reinstallation)';  
        this.setState({bcRes:msg});
      }

      this.setState({dataValues:this.state.dataValues.push(this.state.activityData)});

   
      axios.post(`http://localhost:5000/BCupdate`, 
      {
        idClicked:this.state.idClicked, 
        projId:this.props.id, 
        execStatus:this.state.bcRes, 
        activityName:this.state.nameClicked,
        start_timestamp:this.state.start_timestamp,
        data:this.state.activityData
      },
      {"headers" : {"Access-Control-Allow-Origin": "*"}}
    );      

    };


   setUpListeners = () => {

      this.cy.on('click', 'node', (event) => {
      //getClikedNode
      var start_tmstp = new Date().toLocaleString();
      this.setState({start_timestamp:start_tmstp});
      console.log(event.target['_private']['data']);
      this.setState({nameClicked:event.target['_private']['data']['name']});
      this.setState({idClicked:event.target['_private']['data']['id']});
      var data = prompt('Please Enter Task Data');

      if(data === null){
        console.log('canceled exec');
      }
      else{
        this.setState({activityData:data});
    
        //updateGraphMarkings
        event.preventDefault();
        const idClicked = this.state.idClicked;
        var headers = {
          "Access-Control-Allow-Origin": "*",
        };
        axios.post(`http://localhost:5000/process`, 
          {
            idClicked, 
            projId:this.props.id, 
            activityName:this.state.nameClicked,
            start_timestamp:this.state.start_timestamp,
            data:this.state.activityData
          },
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
      }

    })
  }

  render(){
    const layout = cyto_style['layoutCose'];
    const style = cyto_style['style'];
    const stylesheet = node_style.concat(edge_style);


    return  <div>
      
              <div class="bg-green pt-5 pb-3">

              <div class='container'>
                <h2>Private Projection for the role {this.props.id}</h2>
                <p>This view represents a private DCR projection of the input workflow. Its state is managed in a hybrid fashion.
                  The local tasks are updated locally via API calls.  
                  The public tasks are updated after a call to the smart contract instance of the public projection. </p>

                <p> Execution logs and the markings of the public graph are displayed in the panels below. </p>

                 <p> Click on one of the nodes of the graph below to update the state of the workflow execution. NB. A task needs to be enabled (with a white background here) to be successful. Black tasks are external tasks, managed by another tenant.</p>


              <Card style={{height:'90%','marginTop':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'backgroundColor': '#f09329', 'borderBottom':'white'}}>
                  {this.props.id}</Card.Header>
                <Card.Body >
                  <CytoscapeComponent elements={this.props.data} 
                                        stylesheet={stylesheet} 
                                        layout={layout} 
                                        style={style} 
                                        cy={(cy) => {this.cy = cy}}
                                        boxSelectionEnabled={false}
                                        />    
                </Card.Body>
              </Card>

              <ExecLogger  execLogs = {this.props.execLogs} activityNames={this.state.activityNames}/>
              <PublicMarkings activityNames={this.state.activityNames["default"]} 
                              execLogs = {this.props.execLogs} 
                              activityNamesBis={this.state.activityNames}
                              incl = {this.state.incl}
                              pend = {this.state.pend}
                              exec = {this.state.exec}
                              dataHashes = {this.state.dataHashes}
                              dataValues = {this.state.dataValues}
                              />
              </div>
              </div>
              <footer class="o-footer" id="footer" role="contentinfo">
                <div class="o-footer-bottom">
                  <div class="container">
                    <div class="row mb-0">
                      <ul class="nav">
                        <li class="nav-item"><span class="nav-link">© Caise 2020 submissions - Towards Trusted Declarative BP choreographies</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </footer>

              </div>; 
  }
}

export default DCRgraph
