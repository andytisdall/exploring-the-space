import express from 'express';

const router = express.Router();

router.get('/signout', (req, res) => {
    req.session.jwt = null;
    console.log('signing out');

    res.send({});
});

export { router as signoutRouter };