import express from 'express';
import { Password } from '../services/password.js';
import jwt from 'jsonwebtoken';
import JWT_KEY from '../jwt-key.js';
import { User } from '../models/user.js';


const router = express.Router();


router.post('/signup', async (req, res) => {

    
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
        throw new Error('Username already in use.');
    }

    const user = new User({ username, password });
    await user.save();

    const token = jwt.sign({
        id: user.id,
        bands: user.bands
    }, JWT_KEY);

    res.status(201).send({ user, token });

});


router.post('/signin',
    // [
    //     body('email').isEmail().withMessage('Email must be valid'),
    //     body('password').trim().notEmpty().withMessage('must supply a password!!')
    // ],
    async (req, res) => {

        
        
        // const errors = validationResult(req);

        // if (!errors.isEmpty()) {
        //     res.send(errors.array());
        // }

        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            throw new Error('Credentials Invalid');
        }
        const passwordsMatch = await Password.compare(
            existingUser.password,
            password
        );
        if (!passwordsMatch) {
            throw new Error('Credentials Invalid');
        }
        const token = jwt.sign({
            id: existingUser.id,
            bands: existingUser.bands
        }, JWT_KEY);

        
        res.send({ user: existingUser, token });
    }
);

export { router as authRouter };