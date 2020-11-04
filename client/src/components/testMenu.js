import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import Header from './Header';
import axios, { post } from 'axios';
import ViewGlobal from './ViewGlobal';
import RoleDescription from './roleDescription';

var dcrTexts = require('../projections/dcrTexts.json');

class TestMenu extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      file:null,
      global:dcrTexts['global'],
      globEvents:'',
      globRelations:'',

      roleLength:'',
      projs:[],

    };
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.fileUpload = this.fileUpload.bind(this);
  }

  componentDidMount(){

    var roleLength = dcrTexts['roleMapping'].length;
    
    var i;
    var projs=[];

    projs.push(['public','public'])

    for (i = 1; i <= roleLength; i++) {
      var role=[];
      var r = 'r'+i;
      role.push(r);
      role.push(dcrTexts[r]['role'])
      projs.push(role)
    } 

    this.setState({
      roleLength:roleLength,
      projs:projs
    });


    const globEvents = this.state.global['events'].map((number) =>
    <li key={number['id']}> {number['event']}</li>);
    const globRelations = this.state.global['relations'].map((number) =>
    <li key={number['id']}> {number['relation']}</li>);
    this.setState({
      'globEvents':globEvents,
      'globRelations':globRelations,
  });
  }

  onFormSubmit(e){
    e.preventDefault() // Stop form submit
    this.fileUpload(this.state.file).then((response)=>{
      console.log(response.data);
    })  
  }

  onChange(e) {
    this.setState({file:e.target.files[0]})
  }


  fileUpload(file){
    const url = `https://dcrchoreo.herokuapp.com/inputFile`;
    const formData = new FormData();
    formData.append('file',file);
    const config = {
        headers: {
            'content-type': 'multipart/form-data',
            'Access-Control-Allow-Origin': '*',
        }
    };

    return post(url,formData,config)
  }

  render(){
    return  <div>
             <Header/>
             <Card style={{width: '95%', height:'70%','marginTop':'3vh', 'borderColor':'white'}}>
             <p>
               Welcome to the test portal. Load a DCR file to be projected.
             </p>
             <form onSubmit={this.onFormSubmit}>
              <input type="file" onChange={this.onChange} />
              <button type="submit">Upload</button>
            </form>                   
             </Card>

             <hr  style={{
                width: '95%', 
                'marginLeft':'2.5%',
                color: 'LightGrey',
                backgroundColor: 'LightGrey',
                height: .2,
                borderColor : 'LightGrey'
            }}/>

            <ViewGlobal/>


            <hr  style={{
                width: '95%', 
                'marginLeft':'2.5%',
                color: 'LightGrey',
                backgroundColor: 'LightGrey',
                height: .2,
                borderColor : 'LightGrey'
            }}/>

            <h3>Legend</h3>
            <h4>Event types</h4>
            <p>
              The graph legend depicts four types of events. 
              Choreography events comprise a sender, a receiver, and an event. 
              Send/Receive events correspond to a choreography send or a receive event. Send events are marked with an exclamation mark (!) and receive events with an interrogation mark (?). Plus, they contain the event name, the sender, and the receiver. 
              Internal events comprise the event name only. 
              External events are filled in black.
              </p>

              <h4>Excluded / Included events</h4>
              <p>
              The local projected excluded events are filled in grey, while the local events included and/or executed are filled in white. 
              </p>
              <h4>DCR relations</h4>
              <p>
              The usual DCR relations are figured: include in green, exclude in red, milestone in violet, condition in orange, and response in blue. 
              </p>
              <h3>Execution</h3>
              <p>
              Concerning the process execution, (i) the local events that do not have any interaction with other private projections 
              are executed off-chain, (ii) choreography events and external events are executed in the Ethereum BC through REST API calls. 
              </p>
              
              <h4>Markings</h4>

              <p>
              Each projection holds a marking with both internal and external event states. These are set to one if the event is activated, and null otherwise. 
              </p>

              <h4>Private events</h4>
              <p>
              The trigger of a private event launches the evaluation of the corresponding DCR projection stored locally. 
              When a private event is triggered, its label is sent to the backend via a POST request. 
              The marking of the event is retrieved and examined in the back-end. 
              The activity is executed if included and if its condition and milestone relations are fulfilled. 
              The event marking is updated (executed and not pending), and the events holding a direct relation with the later have their marking 
              updated. Once the event markings are updated, the JSON Cytoscape description of the events is updated accordingly. 
              </p>
              <h4>Public events</h4>
              <p>
              The trigger of a public event launches the evaluation of the public projection stored on-chain. When a public choreography event of type send is triggered,  the back-end invokes the smart contract function corresponding to the execution of the send event. If the corresponding marking is enabled,  the back-end fires a sendEvent transaction to the SC. When the SC receives the sendEvent transaction callback, it fires a receiveEvent transaction. 
              The local markings transcribe the outcome of the smart contract call. When a public external event is triggered, it is updated following the same logic (i.e. checked and validated with the DCR smart contract). %Another option is to compute the termination outcome of the external events in order to preserve privacy. 
              </p>



            <Card style={{width: '95%', height:'70%','marginTop':'3vh', 'borderColor':'white'}}>
            <p>Projections:</p>
             </Card>
            <CardGroup style={{width: '95%', 'marginLeft':'2.5%','marginTop':'3vh'}}>
            {this.state.projs.map(item=> <RoleDescription vals={item[0]}/>)}          
              </CardGroup>

            <hr  style={{
                width: '95%', 
                'marginLeft':'2.5%',
                color: 'LightGrey',
                backgroundColor: 'LightGrey',
                height: .2,
                borderColor : 'LightGrey'
            }}/>


            </div>
;
  }
}

export default TestMenu