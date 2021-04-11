/*
 * @Author: yezunfa
 * @Date: 2020-07-09 11:44:38
 * @LastEditTime: 2021-04-08 21:43:35
 * @Description: Do not edit
 */
module.exports = app => {
    const {
        controller,
    } = app;
    app.router.get('/api/demo', controller.payment.demo)

    app.router.get('/api/free/demo', controller.placeOrder.reservation)

    app.router.get('/api/qr_code', controller.tools.qrcode)
    app.router.get('/api/enable/coupon', controller.coupon.getEnableCoupon)

    app.router.get('/api/system/config', controller.system.Config);
    app.router.get('/api/sys_user/base', controller.system.Base);
    app.router.get('/api/store/info', controller.home.getStoreInfo);
    app.router.post('/api/order/reservation', controller.order.reservation);
    app.router.post('/api/payment', controller.payment.payController);

    app.router.post('/api/private/schedule', controller.course.setPrivateSchedule);

    app.router.get('/api/schedule/query/:Dates/:CourseIds', controller.course.searchschedule);
    app.router.get('/api/label/query/:condition', controller.assist.getLabelFilter);
    app.router.get('/api/course/query/:StoreIds/:ParentIds', controller.assist.courseQueryByLabel);

    app.router.get('/api/reservation/check', controller.user.checkoutResrvation);
    app.router.get('/api/system/dictionary', controller.system.dictionary);
    // 查询已取消次数
    app.router.get('/api/reservation/canceltime', controller.order.checkCancelTime)
    app.router.get('/api/reservation/weekcanceltime', controller.order.getWeekCancelTime)
    // 取消预约
    app.router.post('/api/reservation/cancel', controller.placeOrder.CancelReservation);
    // 取消预约超过两次，禁用会员预约一周
    app.router.post('/api/reservation/memberlimited', controller.user.LimitMemberReservation);
    
    app.router.get('/train_schedule_user/query',controller.course.getByApi)
};
