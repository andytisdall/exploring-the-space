import jwt from 'jsonwebtoken';
import JWT_KEY from '../jwt-key.js';

export const currentUser = (req, res, next) => {
    if (!req.session.jwt) {
        return next();
    }

    const payload = jwt.verify(req.session.jwt, JWT_KEY);

    req.currentUser = payload;
    next();

};