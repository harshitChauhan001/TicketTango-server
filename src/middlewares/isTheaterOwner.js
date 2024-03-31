const jwt = require("jsonwebtoken");

const Theater = require("../models/theaterModel.js");


const isTheaterOwner = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.sendStatus(401); 
    }
  try {
        const decoded = jwt.verify(token, 'secret-code');
        req.userId = decoded.id; 
        const theater = await Theater.findOne({ _id: theaterId, ownerId: `${theaterOwnerId}` });
        if (!theater) {
          return res.status(401).json({ message: 'Unauthorized: Theater not found for the owner' });
        }
    
        next(); 
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
 
  
};
module.exports = isTheaterOwner;
