import { useContext } from "react";
import authContext from "../../contexts/auth/authContext";
import "../stylesheets/dashboard.css";

const Dashboard = () => {
  const { user } = useContext(authContext);
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <div className="container dash">
      <h1>
        {greeting}, {user.username}!
      </h1>
    </div>
  );
};

export default Dashboard;
