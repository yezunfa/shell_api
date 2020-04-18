module.exports = app => {
    const { controller } = app;

    app.router.post('/api/shell_login/wechat', controller.shell.member.wechatLogin) // 用户登陆
    app.router.post('/api/shell_wechat/cryptdata', controller.shell.member.cryptdata)
    
};
