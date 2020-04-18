module.exports = app => {
    const { controller } = app;

    app.router.post('/older/system/packages', controller.migrate.generalpackage);

    app.router.post('/test/migrate', controller.migrate.controller);

    app.router.get('/system/log', controller.system.getsystemlog)
}
