import { useLocation } from "react-router-dom";
import "../stylesheets/problemdetails.css";
import Card from 'react-bootstrap/Card';
import authContext from "../../contexts/auth/authContext";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProblemDetail = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(authContext);
  
  useEffect( () => {
    if(!loading && user.username === "none"){
      navigate('/login');
    }
  }, [navigate, user]);

  const location = useLocation();
  const problem = location.state;

  if (!problem) {
    return <div>No problem details available.</div>; 
  }


  return (
    <div className="container mt-4 mb-4 problem">
      <br />
      <br />
      <div className="title">{problem.title}</div>
      <br />
      <div className="descriptiontitle">Problem Statement: </div>
      <div className="description">{problem.statement}</div>
      <br />
      <div className="descriptiontitle">Input:</div>
      {problem.inputDescription.map((value) => (
        <div key={value._id} className="description">
          {value.description}
        </div>
      ))}
      <br />
      <div className="descriptiontitle">Output:</div>
      {problem.outputDescription.map((value) => (
        <div key={value._id} className="description">
          {value.description}
        </div>
      ))}
      <br />
      <div className="descriptiontitle">Constraints: </div>
      {problem.constraints.map((value) => (
        <ul key={value._id} className="description">
          <li>{value.constraint}</li>
        </ul>
      ))}
      <br />
      <div className="descriptiontitle">Created By: </div>
      <div className="description">{problem.createdBy}</div>
      <br/>
      <br/>
      <div className="descriptiontitle">Test Cases:</div>
      {problem.testcases.map((value) => (
        <Card key={value._id}>
          <Card.Body>
            <div className="input">Input: </div>
            <div>
              {value.inputs.map((value1) => (
                <div key={value1._id}>
                  {value1.input}
                </div>
              ))}
            </div>
            <br/>
            <div className="input">Output: </div>
            <div>{value.output}</div>
            <br/>
            {value.explanation}
            <Card.Text>
            </Card.Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default ProblemDetail;
