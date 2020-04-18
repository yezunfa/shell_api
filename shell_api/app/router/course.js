module.exports = app => {
    const {
        controller,
    } = app;
    app.router.get('/course/privates', controller.course.getCoachScheduling);
    app.router.get('/course/info', controller.course.getCourseScheduleInfo);
    app.router.get('/course/seating', controller.course.getReservationSeating);
    app.router.get('/course/type', controller.coach.getCourseType);
    app.router.get('/course/detail', controller.course.getCourseDetail);

    app.router.get('/coach/info', controller.course.getCoachInfo);
    app.router.get('/coach/invite', controller.course.getInviteInfo);

    app.router.get('/course/invoice', controller.course.getInvoice);
    app.router.get('/course/member', controller.course.getCourseMember);

    app.router.post('/schedule/application', controller.course.newCourseSchedule);
}