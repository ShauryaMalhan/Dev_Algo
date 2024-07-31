import "../stylesheets/login.css";
import { Link } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import InputGroup from "react-bootstrap/InputGroup";
import { useContext } from "react";
import authContext from "../../contexts/auth/authContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(authContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const isValid = (email.length > 5) & (password.length > 5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const LOGIN_URL = import.meta.env.VITE_LOGIN_PATH;
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if(!response.ok) {
        throw new Error(result.error);
      }
      localStorage.setItem('username', result.username);
      setUser({ username: result.username });
      navigate('/');
    } catch (err) {
      throw new Error(err);
    }
  };

  return (
    <>
      <div className="flex">
        <img src="./login.png" className="authimg" alt="login" />
        <div className="loginbox">
          <div className="loginhead">
            <h1>
              Log in to continue your <br></br> coding journey
            </h1>
          </div>
          <br></br>

          <Form className="loginform" onSubmit={handleSubmit}>
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
            Don&#39;t have an account?{" "}
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
