module.exports = app => {
    const {
        controller,
    } = app;
   
    app.router.get('/user/login', controller.user.login);
    app.router.get('/user/login2', controller.user.login2);
    app.router.post('/user/regiter', controller.user.regiter);

    app.router.get('/token/csrf', controller.user.getcsrfToken);
    app.router.get('/token/cookie', controller.user.getCookie);
    
    app.router.post('/api/login/account', controller.user.loginApi);
    app.router.post('/api/login/wechat', controller.user.wechatLogin);
    app.router.get('/api/currentUser', controller.user.currentUserApi);
    app.router.get('/api/auth_routes', controller.user.authRoutesApi);

    app.router.get('/coach/history', controller.user.getUserCoach);
    app.router.get('/coach/list', controller.user.getCoachList);

    app.router.get('/card/info', controller.user.card);
    app.router.get('/user/asset', controller.user.getMemberAssets) // 注意,这里是用户资产,不是会员卡资产
    app.router.get('/user/detail', controller.user.getUserDetailById)


    app.router.get('/user/reservation', controller.user.getUserReservation);
    app.router.get('/user/body', controller.user.getUserBodyInfo);
    app.router.get('/user/coupon', controller.user.getUserCoupon);
    app.router.get('/user/info', controller.user.getMemberInfo);
    app.router.get('/user/info_byId', controller.user.getMemberInfoById);
    app.router.get('/user/activity', controller.user.getMemberActivety);
    app.router.post('/user/course/signin', controller.user.signInCourse);
    app.router.post('/user/store/set', controller.user.setUserStore);
    app.router.post('/user/coach/invite', controller.user.setCoachInvite)

    app.router.post('/user/get/coupon', controller.user.getCoupon);
};
