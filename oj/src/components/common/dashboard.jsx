import { useContext } from "react";
import authContext from "../../contexts/auth/authContext";
import '../stylesheets/dashboard.css';

const Dashboard = () => {
  const a = useContext(authContext);
  return (
    <div className="container dash">
      <h1>Logged in as: {a.user.username}</h1>
    </div>
  );
};

export default Dashboard;
