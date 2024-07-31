import { useContext } from "react";
import authContext from "../../contexts/auth/authContext";
import '../stylesheets/dashboard.css';

const Dashboard = () => {
  const { user } = useContext(authContext);
  return (
    <div className="container dash">
      <h1>Logged in as: {user.username}</h1>
    </div>
  );
};

export default Dashboard;
