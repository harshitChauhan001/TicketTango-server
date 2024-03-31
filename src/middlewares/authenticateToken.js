
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => { 

    const token = req.headers['authorization'];
 
    if (!token) {

        return res.sendStatus(401); 
    }
    try {
        const decoded = jwt.verify(token, 'secret-code');

        req.userId = decoded.id; 
        next(); 
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  

};
module.exports = authenticateToken;
