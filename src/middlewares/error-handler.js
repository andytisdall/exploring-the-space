

export const errorHandler = (err, req, res, next) => {

    let navigateTo = '/';

    if (req.params.bandName) {
        navigateTo = `/${req.params.bandName}`
    }

    console.log('fuck fuck fuck');

    req.session.errorMessage = err.message;
    res.redirect(navigateTo);

};