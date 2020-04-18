module.exports = app => {
    const {
        controller,
    } = app;
    app.router.post('/api/face/log', controller.faceDevice.Log);
    app.router.get('/api/face/log', controller.faceDevice.Log);
    app.router.get('/api/face/logtest', controller.faceDeviceTest.Log);
}