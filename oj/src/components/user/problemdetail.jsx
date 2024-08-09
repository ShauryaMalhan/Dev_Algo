import { useLocation } from "react-router-dom";
import "../stylesheets/problemdetails.css";
import Card from 'react-bootstrap/Card';
import authContext from "../../contexts/auth/authContext";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

const ProblemDetail = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(authContext);
  
  useEffect( () => {
    if(!loading && user.username === "none"){
      navigate('/login');
    }
  }, [navigate, user, loading]);

  const location = useLocation();
  const problem = location.state;

  if (!problem) {
    return <div>No problem details available.</div>; 
  }

  const handleProblemSubmit = (e)=> {
    e.preventDefault();
    navigate(`/problems/${problem._id}/submit`, {state: problem});
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
      {problem.testcases.slice(0, 2).map((value) => (
        <Card key={value._id} className="mt-3 mb-3">
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
      <br/>
      <div className="div_problemSubmit">
        <Button as={Link} className="problemSubmit" onClick={handleProblemSubmit}>Submit Problem</Button>
      </div>
    </div>
  );
};

export default ProblemDetail;
