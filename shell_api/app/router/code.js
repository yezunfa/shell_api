module.exports = app => {
    const {
        controller,
    } = app;
    app.router.get('/code/home', controller.code.home);
    app.router.get('/code/login', controller.code.login);
    app.router.post('/code/login', controller.code.loginApi);
    app.router.get('/code/page', controller.code.page);
    app.router.get('/code/page/list', controller.code.pageList);
    app.router.post('/code/page/save', controller.code.pageSave);
    app.router.post('/code/page/publish', controller.code.pagePublish);
    app.router.get('/render/*', controller.code.pageRender);
}
