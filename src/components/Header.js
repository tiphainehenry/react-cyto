import React from 'react';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/Card';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

class Header extends React.Component {

  constructor(props){
    super(props);
    this.state = {text:null,
                  toBeDisp:'', 
                  global: 'Global DCR to project',
                  choreo:'Choreography Projection', 
                  r1:'Florist Projection',
                  r2:'Driver Projection',
                  r3:'Customer Projection'
                };
  }

  render(){

    return <div>
                 <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" sticky="top">
                <Navbar.Brand href="/">DCR Portal</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="mr-auto">
                    <Nav.Link href="/choreography">Choreography</Nav.Link>
                    <NavDropdown title="Role Projections" id="collasible-nav-dropdown">
                      <NavDropdown.Item href="/florist">{this.state.r1}</NavDropdown.Item>
                      <NavDropdown.Item href="/driver">{this.state.r2}</NavDropdown.Item>
                      <NavDropdown.Item href="/customer">{this.state.r3}</NavDropdown.Item>
                    </NavDropdown>
                  </Nav>
                  <Nav pullRight>
                    
                    <NavDropdown title="Constraints Legend" id="collasible-nav-dropdown">
                      <NavDropdown.Item style={{"font-size":'16px'}}>Post-execution</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#29A81A", "font-size":'12px'}}> -- Include</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#FF0000", "font-size":'12px'}}> -- Exclude</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#1E90FF", "font-size":'12px'}}> -- Response</NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item style={{"font-size":'16px'}}>Pre-execution</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#FFA500", "font-size":'12px'}}> -- Condition</NavDropdown.Item>
                      <NavDropdown.Item style={{color:"#BC1AF2", "font-size":'12px'}}> -- Milestone</NavDropdown.Item>
                    </NavDropdown>
                  </Nav>
                </Navbar.Collapse>
              </Navbar>

          </div>
;
  }
}

export default Header

