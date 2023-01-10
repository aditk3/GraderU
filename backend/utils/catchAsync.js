// eslint-disable-next-line arrow-body-style
module.exports = (fn) => {
    return (req, res, next) => {
        // if function throws and error catch and propigate to global error handler
        fn(req, res, next).catch((err) => next(err));
    };
};
