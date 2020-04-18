module.exports = app => {
    const {
        controller,
    } = app;
    app.router.get('/madingyu', controller.madingyuHome.index);
}
