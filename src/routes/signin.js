import express from 'express';
// import { validationResult } from 'express-validator';
import { User } from '../models/user.js';
import { Password } from '../services/password.js';
import jwt from 'jsonwebtoken';
import JWT_KEY from '../jwt-key.js';

const router = express.Router();



router.get('/signin', (req, res) => {
    res.render('signin');
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

        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            throw new BadRequestError('Invalid Creds');
        }
        const passwordsMatch = await Password.compare(
            existingUser.password,
            password
        );
        if (!passwordsMatch) {
            throw new BadRequestError('invalid creds');
        }
        const userJwt = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        }, JWT_KEY);
        req.session = {
            jwt: userJwt
        }
        res.status(200).send(existingUser);
    }
);

export { router as signinRouter };