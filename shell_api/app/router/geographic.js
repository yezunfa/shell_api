
module.exports = app => {
    const {
        controller,
    } = app;

    app.router.get('/api/geographic/province', controller.geographic.province);
    app.router.get('/api/geographic/city/:province', controller.geographic.city);
    app.router.get('/api/geographic/area/:city', controller.geographic.area);
};