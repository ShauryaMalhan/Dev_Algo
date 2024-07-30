import { useContext } from "react";
import authContext from "../../contexts/auth/authContext";

const Dashboard = () => {
  const a = useContext(authContext);
  return (
    <div className="container">
      <h1>Logged in as: {a.user.username}</h1>
    </div>
  );
};

export default Dashboard;
