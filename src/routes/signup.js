import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import JWT_KEY from '../jwt-key.js';

const router = express.Router();

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {

    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
        throw new Error('Username already in use.');
    }

    const user = new User({ username, password });
    await user.save();

    const userJwt = jwt.sign({
        id: user.id,
        username: user.username
    }, JWT_KEY);

    req.session.jwt = userJwt;


    res.status(201).redirect('/user');

});

export { router as signupRouter };