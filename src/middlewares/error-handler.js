

export const errorHandler = (err, req, res, next) => {

    let navigateTo = '/signin';

    if (req.params.bandName) {
        navigateTo = `/${req.params.bandName}`;
    } else if (req.session.currentUser) {
        navigateTo = '/user';
    }

    console.log(err.message);
    req.session.errorMessage = err.message;
    res.redirect(navigateTo);

};