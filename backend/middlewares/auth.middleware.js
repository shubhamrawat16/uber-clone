const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blackListToken.model');
const captainModel = require('../models/captain.model');


exports.authUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("Authorization header:", authHeader);

    const token = authHeader?.split(" ")[1];
    if (!token) {
        console.warn("❌ No token found in Authorization header");
        return res.status(401).json({ message: "Unauthorized - no token" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("❌ JWT verification failed:", err.message);
            return res.status(401).json({ message: "Unauthorized - invalid token" });
        }
        console.log("✅ JWT verified, decoded payload:", decoded);
        req.user = decoded;
        next();
    });
};


module.exports.authCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];


    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const isBlacklisted = await blackListTokenModel.findOne({ token: token });



    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findById(decoded._id)
        req.captain = captain;

        return next()
    } catch (err) {
        console.log(err);

        res.status(401).json({ message: 'Unauthorized' });
    }
}