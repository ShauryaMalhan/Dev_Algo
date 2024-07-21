import Logincontext from './logincontext'
import { useState } from 'react'

const loginstate = (props) => {
    logincurr = [

    ]
    const [login, setlogin] = useState(logincurr);

    return (
        <Logincontext.Provider value={{login, setlogin}}>
            {props.children}
        </Logincontext.Provider>
    )
}

export default loginstate;