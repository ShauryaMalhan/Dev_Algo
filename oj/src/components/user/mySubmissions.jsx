import { useEffect, useState } from "react";
import { useContext } from "react";
import authContext from "../../contexts/auth/authContext";
import axios from "axios";
import "../stylesheets/submissions.css";

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const { user } = useContext(authContext);
  const mySubmissions = import.meta.env.VITE_MY_SUBMISSIONS_PATH;

  useEffect(() => {
    const myHistory = async () => {
      try {
        const Submissions = await axios.post(mySubmissions, {
          user: user.username,
        });
        setSubmissions(Submissions.data);
      } catch (err) {
        setSubmissions(err);
      }
    };
    myHistory();
  }, [user.username, mySubmissions]);
  console.log(submissions);
  return (
    <div className="container">
      <div className="submissions">
        <div>Date</div>
        <div>User</div>
        <div>Problem</div>
        <div>Verdict</div>
        <div>Language</div>
      </div>
      {submissions.length > 0 ? (
        submissions.map((submission) => (
          <div key={submission._id} className="submissions">
            <div className="time">{submission.time}</div>
            <div>{submission.user}</div>
            <div>{submission.problem}</div>
            <div>{submission.verdict}</div>
            <div>{submission.language}</div>
          </div>
        ))
      ) : (
        <div> No Submission </div>
      )}
    </div>
  );
};

export default MySubmissions;
