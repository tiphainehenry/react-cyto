import React from 'react';
import Card from 'react-bootstrap/Card';

class ExecLogger extends React.Component {
  render(){
    return  <div>

              <Card id="exec" style={{width: '95%', height:'70%','margin-top':'3vh'}}>
              <Card.Header as="p" style= {{color:'white', 'background-color': '#7c9d84', 'font-size': '10pt', 'font-weight': 200, padding: '2ex 1ex'}}>
                  Execution logs</Card.Header>
                <Card.Body >
                  <div>
                    {this.props.execlogs.map(item=> 
                    <div key={item.id+item.timestamp}>{item.timestamp} | TaskName: {item.name}</div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </div>; 
  }
}

export default ExecLogger
