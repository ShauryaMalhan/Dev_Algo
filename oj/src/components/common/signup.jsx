import { Link } from "react-router-dom";
import "../stylesheets/login.css";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import InputGroup from "react-bootstrap/InputGroup";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleFullnameChange = (e) => {
    setFullname(e.target.value);
  };

  const isValid =
    (email.length > 5) &
    (password.length > 5) &
    (username.length > 5) &
    (fullname.length > 5);

  return (
    <>
      <div className="flex">
        <img
          src="./register.png"
          className="authimg signupimg"
          alt="register"
        />
        <div className="loginbox registerbox">
          <div className="loginhead">
            <h1>
              Register<br></br>Start your journey!!
            </h1>
          </div>
          <br></br>
          <Form className="loginform">
            <Form.Group className="mb-3" controlId="formGroupname">
              <Form.Label htmlFor="name" className="emaillabel">
                name
              </Form.Label>
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">Full Name</InputGroup.Text>
                <Form.Control
                  id="name"
                  name="name"
                  type="name"
                  onChange={handleFullnameChange}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formGroupUsername">
              <Form.Label htmlFor="username" className="emaillabel">
                username
              </Form.Label>
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">Username</InputGroup.Text>
                <Form.Control
                  id="username"
                  name="username"
                  type="username"
                  onChange={handleUsernameChange}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formGroupEmail">
              <Form.Label htmlFor="email" className="emaillabel">
                Email address
              </Form.Label>
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">Email</InputGroup.Text>
                <Form.Control
                  id="email"
                  name="email"
                  type="email"
                  onChange={handleEmailChange}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formGroupPassword">
              <Form.Label className="passwordlabel" htmlFor="password">
                Password
              </Form.Label>
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">Password</InputGroup.Text>
                <Form.Control
                  id="password"
                  name="password"
                  type="password"
                  onChange={handlePasswordChange}
                />
              </InputGroup>
            </Form.Group>
            <button
              type="submit"
              className={`loginformbtn  ${isValid ? "btn-green" : ""}`}
              disabled={!isValid}
            >
              Submit
            </button>
          </Form>
          <br></br>
          <h6>
            Already have an account?{" "}
            <Link to="/login" className="createAccount">
              Log in
            </Link>
          </h6>
        </div>
      </div>
    </>
  );
};

export default Register;
