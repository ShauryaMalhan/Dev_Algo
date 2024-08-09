import { Link } from "react-router-dom";
import "../stylesheets/login.css";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import InputGroup from "react-bootstrap/InputGroup";
import { useNavigate } from "react-router-dom";
import Alert from "../services/alert";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setFullname] = useState("");
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleNameChange = (e) => {
    setFullname(e.target.value);
  };

  const isValid =
    (email.length > 5) &
    (password.length > 5) &
    (username.length > 5) &
    (name.length > 5);

  const handleSubmit = async (e)=>{
    e.preventDefault();
    try {
      const REGISTER_URL = import.meta.env.VITE_REGISTER_PATH;
      const respose = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
        })
      })
      const result = await respose.json();
      if(!respose.ok){
        setAlertMessage('Signup failed, please try again');
        setShowAlert(true);
        throw new Error(result.error);
      }
      navigate('/login');
    } catch (err) {
      setShowAlert(true);
      setAlertMessage('Signup failed, please try again');
      throw new Error(err);
    }
  }

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
          <Form className="loginform" onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="name" className="emaillabel">
                name
              </Form.Label>
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">Full Name</InputGroup.Text>
                <Form.Control
                  id="name"
                  name="name"
                  type="name"
                  onChange={handleNameChange}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
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
            <Form.Group className="mb-3">
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
            <Form.Group className="mb-3">
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
          {showAlert && (
            <Alert
              message={alertMessage}
              onClose={() => setShowAlert(false)} // Close handler
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Register;
