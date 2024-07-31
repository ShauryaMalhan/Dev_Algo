/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import AuthContext from "./authContext";

const AuthState = (props)=> {
    const [user, setUser] = useState({ username: "none" });

    useEffect(()=> {
        const storedUser = localStorage.getItem('username');
        if (storedUser) {
            setUser({ username: storedUser });
        }
    }, [setUser]);

    return (
        <AuthContext.Provider value = {{user, setUser}}>
            {props.children}
        </AuthContext.Provider>
    )
}

export default AuthState;