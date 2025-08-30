import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Button from "react-bootstrap/Button";
import "../stylesheets/navbar.css";
import { useContext } from "react";
import authContext from "../../contexts/auth/authContext";
import { useNavigate } from "react-router-dom";

const Usernavbar = () => {
  let location = useLocation();
  useEffect(() => {}, [location]);
  const { user, setUser } = useContext(authContext);
  const navigate = useNavigate();
  const isValid = user.username !== "none";

  const handlelogout = ()=> {
    localStorage.removeItem('username');
    setUser({ username: "none" });
    navigate('/login');
  }

   return (
    <Navbar expand="lg" className="custom-navbar"> 
      <Container>
        <Navbar.Brand as={Link} to="/">
          Pi<span style={{ fontWeight: 'bold' }}>Code</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/problems" className={location.pathname === "/problems" ? "active" : ""}>
              Problem List
            </Nav.Link>
            <Nav.Link as={Link} to="/mySubmissions" className={location.pathname === "/mySubmissions" ? "active" : ""}>
              My Submissions
            </Nav.Link>
            <Nav.Link as={Link} to="/allSubmissions" className={location.pathname === "/allSubmissions" ? "active" : ""}>
              All Submissions
            </Nav.Link>
          </Nav>
          {!isValid ? (
            <>
              <Button as={Link} to="/login" className="nav-btn nav-btn-outline">
                Login
              </Button>
              <Button as={Link} to="/signup" className="nav-btn nav-btn-solid">
                Signup
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} className="nav-btn nav-btn-outline" onClick={handlelogout}>
                Logout
              </Button>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Usernavbar;