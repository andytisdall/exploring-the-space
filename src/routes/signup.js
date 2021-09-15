import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import JWT_KEY from '../jwt-key.js';

const router = express.Router();


router.post('/signup', async (req, res) => {

    
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
        res.status(409);
        throw new Error('Username already in use.');
    }

    const user = new User({ username, password });
    await user.save();

    const token = jwt.sign({
        id: user.id,
    }, JWT_KEY);

    res.status(201).send({ user, token });

});

export { router as signupRouter };