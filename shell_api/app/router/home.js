module.exports = app => {
    const {
        controller,
    } = app;
    app.router.get('/', controller.home.index);
    app.router.get('/index', controller.home.index);
    app.router.get('/home/info', controller.home.info);
    app.router.get('/home/course', controller.home.getCourseList);
    app.router.get('/store/enums', controller.home.getStoreList);

    app.router.get('/test/test', controller.test.index);
}
