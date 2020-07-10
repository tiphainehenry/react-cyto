import React from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import '../style/App.css';

class ExecLogger extends React.Component {
  render(){
    return  <div>

              <Card id="exec" style={{width: '95%', height:'70%','margin-top':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'background-color': '#00881d', 'font-size': '10pt', 'font-weight': 200, padding: '2ex 1ex'}}>
                  Execution logs</Card.Header>
                <Card.Body style={{height:'20%'}}>
                  <div>
                  <p class="card-text">
                    {this.props.execLogs.execLogs.map(item=> 
                      <Row  style= {{'font-size': '10pt', 'font-weight': 200}} xs={1} md={4} >
                        <Col sm>{item.timestamp}</Col>
                        <Col sm>Task: {item.task}</Col>
                        <Col sm>Status: {item.status}</Col>
                      </Row>
                    )}
                  </p>
                  </div>
                </Card.Body>
              </Card>
            </div>; 
  }
}

export default ExecLogger
