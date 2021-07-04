import express from 'express';
import { currentUser } from '../middlewares/current-user.js';
import { Password } from '../services/password.js';
import jwt from 'jsonwebtoken';
import JWT_KEY from '../jwt-key.js';
import { User } from '../models/user.js';

const router = express.Router();


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
        const userJwt = jwt.sign({
            id: existingUser.id,
            username: existingUser.username
        }, JWT_KEY);

        req.session.jwt = userJwt;
        
        res.send(existingUser);
    }
);

export { router as signinRouter };