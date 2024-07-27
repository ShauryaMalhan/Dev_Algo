import { useLocation } from "react-router-dom";
import Card from 'react-bootstrap/Card';

const ProblemDetail = () => {
    const location = useLocation();
    const problem = location.state;
  
    return (
      <div className="container mt-4">
        <Card>
          <Card.Body>
            <Card.Title>{problem.title}</Card.Title>
            <Card.Text>{problem.statement}</Card.Text>
            <Card.Text><strong>Input Description:</strong> {problem.inputDescription}</Card.Text>
            <Card.Text><strong>Constraints:</strong> {problem.constraints}</Card.Text>
            <Card.Text><strong>Created By:</strong> {problem.createdBy}</Card.Text>
          </Card.Body>
        </Card>
      </div>
    );
  };
  
  export default ProblemDetail;