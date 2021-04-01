

export const requireAuth = (req, res, next) => {
    if (!req.currentUser) {
        throw new Error('no fucking user');
    }
    next();
};