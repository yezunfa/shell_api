module.exports = app => {
    const { controller } = app;
    app.router.get('/coach/schedule', controller.coach.getCoachSchedule);
    app.router.get('/coach/reservation', controller.coach.getPrivateRervation);  
    app.router.post('/coach/login', controller.coach.login); 
    app.router.get('/client/info', controller.coach.getCoachClient);
    app.router.get('/coach/statistics', controller.coach.getCoachStatistics);
    app.router.get('/coach/member/remark', controller.coach.setMemberRemark);

    app.router.get('/coach/memo', controller.coach.getCoachMemo);
    app.router.post('/coach/memberinvite', controller.coach.inviteMember);
};
