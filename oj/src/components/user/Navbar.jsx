import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const Usernavbar = ()=> {
  let location = useLocation();

  useEffect(() => {
  }, [location]);
  return (
    <Navbar expand="lg" style={{backgroundColor: 'cyan'}} className='navbar-dark bg-dark'>
      <Container>
        <Navbar.Brand as={ Link } to="#home">Code Runner</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={ Link } to="#home" className={location.pathname === "/home" ? "active" : ""}>Home</Nav.Link>
            <Nav.Link as={ Link } to="#link" className={location.pathname === "/home" ? "active" : ""}>Link</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item as={ Link } to="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item as={ Link } to="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item as={ Link } to="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={ Link } to="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Usernavbar
