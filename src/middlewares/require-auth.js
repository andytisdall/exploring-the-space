

export const requireAuth = (req, res, next) => {
    // console.log(req.currentUser);
    if (!req.currentUser) {
        return res.redirect('/signin');
    }
    next();
};