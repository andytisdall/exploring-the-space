

export const errorHandler = (err, req, res, next) => {

    console.error(err);
    res.status(400).send({ error: err.message });

};