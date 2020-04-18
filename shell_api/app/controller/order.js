'use strict';

const Controller = require('egg').Controller;
const moment = require("moment");
const utils = require('../utils/index');
const uuid = require('uuid')
class Order extends Controller {

    /**
     * 生成一笔预约订单
     * todo 事务 ; 联动coach_invite
     */
    async reservation() {
        const ctx = this.ctx
        const { userid } = ctx.query // todo 从session 取
        const order_time = new Date()
        const { mobile, seating, coursescheduleId, start, end, paylist } = ctx.request.body
        const pay_list = JSON.parse(paylist)
        if(!(pay_list && pay_list instanceof Array)) { 
            ctx.body = {
                success: false,
                code: 413,
                message: "参数错误"
            }
            return
        }

        try {
            // 验证当前预约是否可以继续
            const reservation_check = await ctx.service.memberExpand.checkReservation({ // 校验预约记录
                start, end, courseScheduleId: coursescheduleId, seating
            })

            this.ctx.logger.info(reservation_check, 'reservation_checkreservation_check')

            // 预约验证不成功
            if(!reservation_check.success) {
                const { data } = reservation_check;
                
                if (data.length > 0) {
                    let user_reservation = data.find(item => item.UserId === userid);
                    // 未支付的直接进入得新支付
                    if (user_reservation) {
                        if(user_reservation.State === 0) { // 未支付
                            const rOderInfo = await ctx.service.memberReservationExpand.getResrvationInfoById(user_reservation.Id);
                                this.ctx.logger.info('重新支付', rOderInfo);
                                ctx.body = {
                                    success: true,
                                    code: 200,
                                    message: '重新支付',
                                    data: {
                                        orderid: rOderInfo.orderId,
                                        orderNo: rOderInfo.orderNo,
                                        reservationid: user_reservation.Id,
                                        consuming: `${new Date() - order_time}ms`
                                    }
                            }
                            return;
                        } else {
                            ctx.body = {
                                success: false,
                                code: 413,
                                data: user_reservation,
                                message: "不能重复预约"
                            }
                            return
                        }
                        
                    } else {
                        ctx.body = {
                            success: false,
                            code: 413,
                            data: user_reservation,
                            message: "此时间已经被预约"
                        }
                        return
                    }
                }
            }
            
            const reservation_id = uuid.v1()
            const order_id = uuid.v4()
            const order_sub_id = uuid.v4()
            const course_schedule_info = await ctx.service.courseExpand.getCourseScheduleInfo(coursescheduleId) // 校验排课数据
            if (!course_schedule_info[0]) {
                ctx.body = {
                    success: false,
                    code: 413,
                    message: "找不到这节课的信息"
                }
                return
            }
            const { Name, StoreId, StoreName, Price, StoredValuePrice, MemberPrice } = course_schedule_info[0]
            if (!Price || !StoredValuePrice || !MemberPrice) {
                ctx.body = {
                    success: false,
                    code: 413,
                    message: "支付价格错误"
                }
                ctx.logger.error({
                    message: '价格不能为空',
                    path: '/app/controller/order.js',
                    row: 68
                })
                return
            }
            const order_code = uuid.v1().split('-').join('') // todo
            await ctx.service.memberReservation.create({ // 创建预约记录 
                Id: reservation_id,
                Code: uuid.v1().split('-').join(''), // todo
                UserId: userid,
                Mobile: mobile,
                Seat: seating,
                CourseScheduleId: coursescheduleId,
                CourseName: Name,
                StartTime: start,
                EndTime: end,
                State: 0,
                StoreId,
                StoreName,
                CreateTime: order_time,
                CreatePerson: userid
            })
            await ctx.service.orderMain.create({ // 创建订单
                Id: order_id,
                Code: order_code,
                Name: `预约订单`,
                UserId: userid,
                Type: 4,
                Source: 1,
                StoreId,
                CreateTime: order_time,
                CreatePerson: userid
            })
            await ctx.service.orderSub.create({ // 创建子订单
                Id: order_sub_id,
                OrderId: order_id,
                ProductName: Name,
                ProductState: 1,
                ProductType: 4,
                ReservationId: reservation_id,
                StoreId,
                Price,
                StoredValuePrice,
                MemberPrice,
                Count: 1,
                CreateTime: order_time,
                CreatePerson: userid
            })
            // 计算需要支付的金额(todo 优惠卷处理，当前暂不支持优惠卷。优惠卷逻辑需要和甲方核对)
            // let couponid = pay_list.find(item => item.way === 0).payid
            // const coupon_info = await ctx.service.memberCoupon.getById(couponid)
            // todo coupon_info计算需要支付的金额
            ctx.body = {
                success: true,
                code: 200,
                message: 'reservation_result',
                data: {
                    orderid: order_id,
                    orderNo: order_code,
                    reservationid: reservation_id,
                    consuming: `${new Date() - order_time}ms`
                }
            }
        } catch (error) {
            console.log('下单失败')
            console.log(error)
            this.ctx.logger.error(error, '下单失败')
            ctx.body = {
                success: false,
                code: 444,
                message: error.message,
            }
        }
    }
    
    /**
     * 使用优惠卷
     */
    async orderByCoupon() {
        const { ctx } = this
        const { userid } = ctx.query
        const { orderid, couponid, TotalAmount = 200 } = ctx.request.body
        const CreateTime = new Date()
        try {
            const couponInfo = await ctx.service.memberCoupon.getDetailById(couponid)
            if (couponInfo.length <= 0) {
                ctx.body = {
                    success: false,
                    message: `优惠卷已失效`,
                    code: 511
                }
                return
            }
            // todo 校验userid
            const { CouponId } = couponInfo[0]
            const order_info = await ctx.service.orderMain.getById(orderid) 
            const { Id, Code } = order_info
            if (!Id) {
                ctx.body = {
                    success: false,
                    message: `订单号错误:${Code}`,
                    code: 512
                }
                return
            }
            const OrderId = Id
            if (parseInt(order_info.PayState) === 1) {
                ctx.body = {
                    success: false,
                    message: `订单已支付`,
                    code: 512
                }
                return
            }
            await ctx.service.memberCoupon.setOrderId({ OrderId, CouponId })
            let Amount = 0
            const { CouponType, Discount } = couponInfo[0]
            switch (parseInt(CouponType)) {
                case 1: // 代金券
                    Amount = parseInt(TotalAmount) - parseInt(Discount)
                    break;
                case 2: // 折扣券
                    Amount = parseInt(TotalAmount) * parseInt(Discount) / 10
                default:
                    Amount = parseInt(TotalAmount)
                    break;
            }
            if (Amount < 0) Amount = 0
            Object.assign(order_info, {Amount, TotalAmount})
            const result = await ctx.service.orderMain.edit(order_info) // update 主订单 todo result校验
            ctx.body = {
                success: true,
                code: 200,
                message: 'reservation_result',
                data: {
                    orderid: order_info.Id,
                    orderNo: order_info.Code,
                    consuming: `${new Date() - CreateTime}ms`
                }
            }
        } catch (error) {
            console.log(error)
            ctx.logger.error(error, '下单失败')
            ctx.body = {
                success: false,
                code: 444,
                message: error.message,
            }
        }
    }

    async checkCancelTime () {
        const { ctx } = this
        const { userid: Id } = ctx.query // todo 从session 取
        try {
            const cancel = await ctx.service.memberReservation.checkCancelTime(Id)
            ctx.body = {
                success: true,
                code: 200,
                message: `本月已取消预约${cancel.length}次`,
                data: {
                    total: cancel.length,
                    CancelList: cancel
                }
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                success: true,
                code: 200,
                message: `服务异常，请刷新重试`,
                data: error
            }
        }
    }

    async getWeekCancelTime () {
        const { ctx } = this
        const { userid: Id } = ctx.query 
        try {
            const cancel = await ctx.service.courseExpand.getUserCancel(Id)
            ctx.body = {
                success: true,
                code: 200,
                message: `本月已取消预约${cancel.length}次`,
                data: {
                    total: cancel.length,
                    CancelList: cancel
                }
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                success: true,
                code: 200,
                message: `服务异常，请刷新重试`,
                data: error
            }
        }
    }
}


module.exports = Order;
