import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import authContext from "../../contexts/auth/authContext";


const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const { user, setUser, loading } = useContext(authContext);

    useEffect(()=> {
        const storedUser = localStorage.getItem('username');
        if(storedUser){
          setUser({username: storedUser});
        }
    }, [setUser]);

    useEffect(() => {
        if (!loading && user.username === "none") {
            return navigate('/login');
        }
    }, [user, navigate, loading]);

    return children;
}

export default ProtectedRoute;