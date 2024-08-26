/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import AuthContext from "./authContext";

const AuthState = (props)=> {
    const [user, setUser] = useState({ username: "none" });
    const [loading, setLoading] = useState(true);
    useEffect(()=> { 
        const storedUser = localStorage.getItem('username');
        if (storedUser) {
            setUser({ username: storedUser });
        }
        setLoading(false);
    }, [setUser]);

    return (
        <AuthContext.Provider value = {{user, setUser, loading, setLoading}}>
            {props.children}
        </AuthContext.Provider>
    )
}

export default AuthState;