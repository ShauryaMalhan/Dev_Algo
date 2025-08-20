import jwt from 'jsonwebtoken';

const fetchAdmin = (req, res, next)=> {
    const token = req.header('auth-token');
    if(!token){
        return res.status(401).send({error: "Pls Authenticate using a valid token"})
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET)
        req.admin = data.admin;
        next();
    } catch (error) {
        return res.status(401).send({error: "Pls Authenticate using a valid token"})
    }
}

export default fetchAdmin;