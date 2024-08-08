import Card from "react-bootstrap/Card";
import { fetchProblems } from "../services/problems.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../stylesheets/problems.css';

const Problem = () => {
  const [problems, setProblems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      try {
        const problemData = await fetchProblems();
        setProblems(problemData);
      } catch (err) {
        setProblems(err);
      }
    };
    getData();
  }, []);


  const handleCardClick = (problem) => {
    navigate(`/problems/${problem._id}`, { state: problem });
  };

  return (
    <div>
      <div className="problems">
        {problems.length > 0 ? (
          problems.map((problem) => (
            <Card
              key={problem._id}
              className="mb-3"
              onClick={() => handleCardClick(problem)} 
              style={{ cursor: "pointer" }}
            >
              <Card.Body>
                <Card.Title>{problem.title}</Card.Title>
              </Card.Body>
            </Card>
          ))
        ) : (
          <div>Loading problems...</div>
        )}
      </div>
    </div>
  );
};

export default Problem;
