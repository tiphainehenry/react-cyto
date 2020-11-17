import React from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import '../style/App.css';
import { Button } from 'react-bootstrap';

import SimpleDCReum from '../contracts/SimpleDCReum.json';
import getWeb3 from '../getWeb3';


class ExecLogger extends React.Component {

  constructor(props){
    super(props);
    this.state = {
                  web3: null,
                  accounts: null,
                  contract: null, 
                };
    this.checkHash = this.checkHash.bind(this);
  }
  
  checkHash = async (ev) => {
    alert('Checking Hash');

    // check if BC node

    if(ev.status.includes('public')){
      const { accounts, contract } = this.state;

      try{
        const hashesVector = await contract.methods.getHashes().call();
  
        var dataToCheck = ev.data;
        var taskTriggered = ev.task;
    
        // retrieve data hash with activity id       
        if(taskTriggered.charAt(0) =='e'){
          var lastChar = taskTriggered.charAt(taskTriggered.length-1);
  
          console.log(lastChar)
    
          var activities = []
          switch(lastChar){
            case 's':
              activities = this.props.activityNames["send"];
              break;
            case 'r':
              activities = this.props.activityNames["receive"];
              break;
            default:
              activities = this.props.activityNames["default"];
          }
        }
        else{
          activities = this.props.activityNames["default"];
        }
        const isElem = (element) => element.includes(taskTriggered);
        var activityId= activities.findIndex(isElem);

        // check hashes
        if(hashesVector[activityId]==this.state.web3.utils.fromAscii(dataToCheck)){
          window.alert('success, data has been authenticated.');
        }
        else{
          window.alert('data authentication failed. The hashes do not correspond')
        }
      }
      catch (err) {
        window.alert(err);  
        console.log("web3.eth.handleRevert =", this.state.web3.eth.handleRevert);
        this.setState({wkState:'Create Global Workflow OnChain'});
      }
  
    }
    else{
      window.alert('private task, data authentication not applicable.');
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
    } catch (error) {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
    };

  }



  render(){
    return  <div>
              <Card id="exec" style={{height:'70%','marginTop':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'backgroundColor': '#32a86f', 'borderBottom':'white'}}>
                  Execution logs</Card.Header>
                <Card.Body style={{height:'20%'}}>
                  <div className="card-text" >
                    {this.props.execLogs.execLogs.map(item=> 
                    <div>
                      <Row  key={item.id} style= {{'fontSize': '10pt', 'fontWeight': 200}} xs={1} md={5} >
                        <Col sm>Start:{item.timestamp_startTask}</Col>
                        <Col sm>End:{item.timestamp_endTask}</Col>
                        <Col sm>Task: {item.task}</Col>
                        <Col sm>Status: {item.status}</Col>
                        <Col sm>Data: {item.data}</Col>
                      </Row>
      
                      <hr  style={{
                        width: '95%', 
                        color: 'LightGrey',
                        backgroundColor: 'LightGrey',
                        height: .1,
                        borderColor : 'LightGrey'
                      }}/>
            </div>

                    )}
                  </div>
                </Card.Body>
              </Card>
            </div>; 
  }
}

export default ExecLogger
