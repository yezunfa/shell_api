'use strict';

module.exports = app => {

    const {router, controller, middleware} = app;

    router.post('/wechat/cryptdata', controller.wechat.cryptdata);

    router.post('/api/wechat/login', controller.login.userlogin);
    router.post('/api/wechat/logon', controller.login.wechatlogon);

    router.post('/api/message/formid', controller.wechat.saveFormId)

    router.post('/api/wechat_coach/login', controller.wechat.getOpenId);

    router.get('/api/wechat_union/create', controller.wechat.CreateUnionId);
    router.get('/api/wechat_union/bind', controller.wechat.BindUnionId)
    router.get('/api/wechat_union/check', controller.wechat.BindUnionId)

    // 花礼说
    router.get('/QUMDtiWgKq.txt', controller.wechat.hualishuoDomainCheck)
}