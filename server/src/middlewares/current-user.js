import jwt from 'jsonwebtoken';
import JWT_KEY from '../jwt-key.js';
import { User } from '../models/user.js';

export const currentUser = async (req, res, next) => {

    const { authorization } = req.headers;

    if (!authorization) {
        console.log('no jwt');
        return next();
    }

    const token = authorization.replace('Bearer ', '');

    const payload = jwt.verify(token, JWT_KEY);
    req.currentUser = await User.findById(payload.id);
    next();

};