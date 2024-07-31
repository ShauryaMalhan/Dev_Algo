import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import authContext from "../../contexts/auth/authContext";

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const { user } = useContext(authContext);

    useEffect(() => {
        if (user.username === "none") {
            navigate('/login');
        }
    }, [user, navigate]);

    return children;
}

export default ProtectedRoute;