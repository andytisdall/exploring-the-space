import express from 'express';

const router = express.Router();

router.get('/signout', (req, res) => {
    req.session = null;
    console.log('ok');

    res.redirect('/signin');
});

export { router as signoutRouter };