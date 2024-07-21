import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Button from "react-bootstrap/Button";
import '../stylesheets/navbar.css';

const Usernavbar = () => {
  let location = useLocation();
  useEffect(() => {}, [location]);
  return (
    <Navbar expand="lg" className="navbar-dark bg-dark">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Code Runner
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/problems"
              className={location.pathname === "/problems" ? "active" : ""}
            >
              Problem List
            </Nav.Link>
          </Nav>
          <Button as={Link} to="/login" className="loginbtn">
            Login
          </Button>
          <Button Button as={Link} to="/signup" className="signupbtn">
            Signup
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Usernavbar;
