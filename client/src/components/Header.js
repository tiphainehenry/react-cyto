import React from 'react';
import { Navbar, Nav, NavDropdown} from 'react-bootstrap';
import '../style/boosted.min.css';

var dcrTexts = require('../projections/dcrTexts.json');


class Header extends React.Component {

  constructor(props){
    super(props);
    this.state = {text:null,
                  toBeDisp:'', 
                  global: 'Global DCR to project',
                  public:'Public Projection', 
                  roleLength:'',
                  roles:[],
                };
  }


  componentDidMount(){
    var roleLength = dcrTexts['roleMapping'].length;
    
    var i;
    var roles=[];

    for (i = 1; i <= roleLength; i++) {
      var role=[];
      var r = 'r'+i;
      role.push('/'+r);
      role.push(dcrTexts[r]['role'])
      roles.push(role)
    } 
    this.setState({
      roleLength:roleLength,
      roles:roles
    });

  }

  
  render(){

    return <div>

                 <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" sticky="top" class="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
        
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="mr-auto">
                    <Nav.Link href="/">Homepage</Nav.Link>
                    <Nav.Link href="/public">Public Projection</Nav.Link>
                    <NavDropdown title="Role Projections" id="collasible-nav-dropdown">
                    {this.state.roles.map(item=> 
                      <NavDropdown.Item href={item[0]}>{item[1]}</NavDropdown.Item>
                      )}
                    </NavDropdown>
                  </Nav>

                  <Nav >
                  <NavDropdown title="Constraints Legend" id="collasible-nav-dropdown">
                      <NavDropdown.Item style={{"fontSize":'16px'}}>Post-execution</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#29A81A", "fontSize":'12px'}}> -- Include</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#FF0000", "fontSize":'12px'}}> -- Exclude</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#1E90FF", "fontSize":'12px'}}> -- Response</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item style={{"fontSize":'16px'}}>Pre-execution</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#FFA500", "fontSize":'12px'}}> -- Condition</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#BC1AF2", "fontSize":'12px'}}> -- Milestone</NavDropdown.Item>
                    </NavDropdown>
                  </Nav>
                </Navbar.Collapse>
              </Navbar>

          </div>
;
  }
}

export default Header

