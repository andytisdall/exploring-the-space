

export const errorHandler = (err, req, res, next) => {

    console.error(err);
    // if (res.statusCode === 200) {
    //     res.status(400);
    // }
    res.send({ error: err.message });

};