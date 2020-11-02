import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

var dcrTexts = require('../projections/dcrTexts.json');

class RoleDescription extends React.Component {


  constructor(props){
    super(props);
    this.state = {
      roleName:'',
      PEvents:'',
      EEvents:'',
      Relations:'',
    };
  }

  componentDidMount(){

    var drc_r = dcrTexts[this.props.vals];

    const PEvents = drc_r['privateEvents'].map((number) =>
    <li key={number['id']}> {number['event']}</li>);
    const EEvents = drc_r['externalEvents'].map((number) =>
    <li key={number['id']}> {number['event']}</li>);
    const Relations = drc_r['relations'].map((number) =>
    <li key={number['id']}> {number['relation']}</li>);

    var roleName='';
    if(this.props.vals=='public'){
      roleName='Public';
    }
    else{
      roleName=drc_r['role'];
    }

    if(EEvents.length ==0){
      this.setState({
        'roleName':roleName,
        'PEvents':PEvents,
        'EEvents':['NA'],
        'Relations':Relations,
    });  
    }
    else{
      this.setState({
        'roleName':roleName,
        'PEvents':PEvents,
        'EEvents':EEvents,
        'Relations':Relations,
    });  
    }

  }


  render(){
    return  <div>
              <Card>
              <Card.Title style={{paddingLeft:'5%', paddingTop:'2.5%'}}> {this.state.roleName}</Card.Title>
                <Card.Body>
                <Card.Text>
                  <ListGroup>
                  <ListGroup.Item>
                    <ul>Private Events</ul>
                    <ul>{this.state.PEvents}</ul>
                  </ListGroup.Item>
                  <ListGroup.Item>
                  <ul>Public Events</ul>
                    <ul>{this.state.EEvents}</ul>
                    </ListGroup.Item>
                  <ListGroup.Item>
                    <ul>Relations</ul>
                    <ul>{this.state.Relations}</ul>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Text>
              </Card.Body>
              </Card>
              </div>

;
  }
}

export default RoleDescription