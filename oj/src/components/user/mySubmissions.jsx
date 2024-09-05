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
        setSubmissions(Submissions.data.reverse());
      } catch (err) {
        setSubmissions(err);
      }
    };
    myHistory();
  }, [user.username, mySubmissions]);

  return (
    <div className="container">
      <div className="submissionsHead">My Submissions</div>
      <div className="submissionsHead submissions">
        <div>Date</div>
        <div>User</div>
        <div>Problem</div>
        <div>Verdict</div>
        <div>Language</div>
      </div>
      {submissions.length > 0 ? (
        submissions.map((submission) => (
          <div key={submission._id} className="submissions">
            <div className="time">
              <div>{new Date(submission.time).toLocaleDateString()}</div>
              <div>{new Date(submission.time).toLocaleTimeString()}</div>
            </div>
            <div>{submission.user}</div>
            <div>{submission.problem}</div>
            <div>{submission.verdict}</div>
            <div>{submission.language}</div>
          </div>
        ))
      ) : (
        <div className="no-submission">No Submission</div>
      )}
    </div>
  );
};

export default MySubmissions;
