import React from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import '../style/App.css';

import { Button } from 'react-bootstrap';

import SimpleDCReum from '../contracts/SimpleDCReum.json';
import getWeb3 from '../getWeb3';


class PublicMarkings extends React.Component {


  constructor(props){
    super(props);
    this.state = {
                  taskData:[],
                  length:this.props.activityNames.length,

                  web3: null,
                  accounts: null,
                  contract: null, 
                };
    this.checkHash = this.checkHash.bind(this);
  }
  
  checkHash = async (ev) => {
    alert('Checking Hash');

    // check if BC node

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

//    <Col sm><Button value={this.props.execLogs.execLogs}
//    style= {{'fontSize': '10pt', 'fontWeight': 200, 'backgroundColor':'none','border':'none'}}  
//    onClick={() => this.checkHash(this.props.execLogs.execLogs)}>Check Data Value
//</Button></Col>

  }


  render(){
    return  <div>
              <Card style={{width: '95%', height:'90%','marginTop':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'backgroundColor': '#a267c9', 'fontSize': '10pt', 'fontWeight': 200, padding: '2ex 1ex'}}>
                  Public projection instance marking vectors</Card.Header>
                <Card.Body >
                <Row  style= {{'fontSize': '10pt', 'fontWeight': 1000}} xs={1} md={3} >
                      <Col sm>Activity</Col>
                      <Col sm>Marking (incl, exec, pend)</Col>
                      <Col sm>Data Hash</Col>                  
                </Row>                  
                <hr  style={{
                        width: '95%', 
                        color: 'LightGrey',
                        backgroundColor: 'LightGrey',
                        height: .1,
                        borderColor : 'LightGrey'
                      }}/>

                  {Array.from({length:this.props.activityNames.length}, (x,i)=>
                  <div>
                      <Row  key={i} style= {{'fontSize': '10pt', 'fontWeight': 200}} xs={1} md={3} >
                      <Col sm>{this.props.activityNames[i]}</Col>
                      <Col sm>({this.props.incl[i]},{this.props.exec[i]},{this.props.pend[i]})</Col>
                      <Col sm>{this.props.dataHashes[i]}</Col>

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

                </Card.Body>
              </Card>
            </div>; 
  }
}

export default PublicMarkings
