import "../stylesheets/login.css";
import { Link } from "react-router-dom";
import Form from "react-bootstrap/Form";

const Login = () => {
  return (
    <>
      <div className="flex">
        <img src="./login.png" className="login" alt="login" />
        <div className="loginbox">
          <div className="loginhead">
            <h1>
              Log in to continue your <br></br> coding journey
            </h1>
          </div>
          <br></br>
          <Form className="loginform">
            <Form.Group className="mb-3" controlId="formGroupEmail">
              <Form.Control type="email" placeholder="Enter email" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formGroupPassword">
              <Form.Control type="password" placeholder="Password" />
            </Form.Group>
          </Form>
          <h6>Don't have an account? <Link to="/signup" className="createAccount">Sign up</Link></h6>
        </div>
      </div>
    </>
  );
};

export default Login;
