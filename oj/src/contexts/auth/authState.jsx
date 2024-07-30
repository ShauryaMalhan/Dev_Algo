/* eslint-disable react/prop-types */
import { useState } from "react";
import AuthContext from "./authContext";

const AuthState = (props)=> {
    const [user, setUser] = useState({username: "none"});

    return (
        <AuthContext.Provider value = {{user, setUser}}>
            {props.children}
        </AuthContext.Provider>
    )
}

export default AuthState;