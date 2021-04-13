import express from 'express';

const router = express.Router();

router.get('/signout', (req, res) => {
    req.session.jwt = null;
    console.log('signing out');

    res.redirect('/signin');
});

export { router as signoutRouter };