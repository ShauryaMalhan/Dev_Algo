import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import authContext from "../../contexts/auth/authContext";

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(authContext);

    useEffect(()=> {
        const storedUser = localStorage.getItem('username');
        if(storedUser){
          setUser({username: storedUser});
        }
    }, [setUser]);

    useEffect(() => {
        if (user.username === "none") {
            return navigate('/login');
        }
    }, [user, navigate]);

    return children;
}

export default ProtectedRoute;