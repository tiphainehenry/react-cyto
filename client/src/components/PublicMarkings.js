import React from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import '../style/App.css';

class PublicMarkings extends React.Component {
  render(){
    return  <div>
              <Card style={{width: '95%', height:'90%','marginTop':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'backgroundColor': '#006588', 'fontSize': '10pt', 'fontWeight': 200, padding: '2ex 1ex'}}>
                  Public projection instance marking vectors</Card.Header>
                <Card.Body >
                  <p>{this.props.lg_activityNames}</p>
                  <p>{this.props.incl}</p>
                  <p>{this.props.pend}</p>
                  <p>{this.props.exec}</p>
                </Card.Body>
              </Card>
            </div>; 
  }
}

export default PublicMarkings
