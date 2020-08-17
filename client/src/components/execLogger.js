import React from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import '../style/App.css';

class ExecLogger extends React.Component {
  render(){
    return  <div>
              <Card id="exec" style={{width: '95%', height:'70%','marginTop':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'backgroundColor': '#00881d', 'fontSize': '10pt', 'fontWeight': 200, padding: '2ex 1ex'}}>
                  Execution logs</Card.Header>
                <Card.Body style={{height:'20%'}}>
                  <div className="card-text" >
                    {this.props.execLogs.execLogs.map(item=> 
                      <Row  key={item.id} style= {{'fontSize': '10pt', 'fontWeight': 200}} xs={1} md={4} >
                        <Col sm>{item.timestamp}</Col>
                        <Col sm>Task: {item.task}</Col>
                        <Col sm>Status: {item.status}</Col>
                      </Row>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </div>; 
  }
}

export default ExecLogger
