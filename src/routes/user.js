import express from 'express';
import { currentUser } from '../middlewares/current-user.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { User } from '../models/user.js';

const router = express.Router();

router.get('/user', currentUser, requireAuth, async (req, res) => {

    const user = await User.findById(req.currentUser.id).populate('bands');

    res.render('user', { user, errorMessage: req.session.errorMessage });
});

export { router as userRouter };