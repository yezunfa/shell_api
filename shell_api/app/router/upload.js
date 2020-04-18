module.exports = app => {
    const {
      controller,
    } = app;
    app.router.get('/img/upload', controller.upload.index);
    app.router.post('/img/upload', app.controller.upload.upload);
    app.router.post('/ueditor/ue', app.controller.upload.ueditor);
    app.router.get('/ueditor/ue', app.controller.upload.ueditor);
  };
  