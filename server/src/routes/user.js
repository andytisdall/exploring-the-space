import express from 'express';
import { currentUser } from '../middlewares/current-user.js';
import { User } from '../models/user.js';

const router = express.Router();

router.get('/user', currentUser, async (req, res) => {

    if (!req.currentUser) {
        return res.send(null);
    }

    res.send(req.currentUser);
});


export { router as userRouter };