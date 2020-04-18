module.exports = app => {
    const { controller } = app;
    app.router.get('/system/administrator/destroy/:password/:unionid', controller.tools.DestroyMember)
};
