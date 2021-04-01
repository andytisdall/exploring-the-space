import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import JWT_KEY from '../jwt-key';

const router = express.Router();

router.post('/api/users/signup', async (req, res) => {

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
        throw new Error('Email already in use.');
    }

    const user = new User({ email, password });
    await user.save();

    const userJwt = jwt.sign({
        id: user.id,
        email: user.email
    }, JWT_KEY);

    req.session = {
        jwt: userJwt
    }

    res.status(201).send(user);

});

export { router as signupRouter };