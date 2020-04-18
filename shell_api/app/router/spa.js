module.exports = app => {
    const {
        controller,
    } = app;
    app.router.get('/spa/*', controller.spa.index);
};
