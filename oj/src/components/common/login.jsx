import "../stylesheets/login.css";
import { Link } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

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
              <Form.Label htmlFor="email" className="emaillabel">Email address</Form.Label>
              <Form.Control
                id="email"
                name="email"
                type="email"
                placeholder="Enter email"
                onChange={handleEmailChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formGroupPassword">
              <Form.Label className="passwordlabel" htmlFor="password">Password</Form.Label>
              <Form.Control
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                onChange={handlePasswordChange}
              />
            </Form.Group>
            <button type="submit" className={`loginformbtn  ${email.length > 5 & password.length > 5 ? "btn-green" : ""}`} >Submit</button>
          </Form>
          <br></br>
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
