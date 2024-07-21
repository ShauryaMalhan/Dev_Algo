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
              <Form.Label htmlFor="email">Email address</Form.Label>
              <Form.Control
                id="email"
                name="email"
                type="email"
                placeholder="Enter email"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formGroupPassword">
              <Form.Label htmlFor="password">Password</Form.Label>
              <Form.Control
                id="password"
                name="password"
                type="password"
                placeholder="Password"
              />
            </Form.Group>
            <button type="submit">Submit</button>
          </Form>
          <h6>
            Don't have an account?{" "}
            <Link to="/signup" className="createAccount">
              Sign up
            </Link>
          </h6>
        </div>
      </div>
    </>
  );
};

export default Login;
