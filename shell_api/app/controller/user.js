'use strict';


const Controller = require('egg').Controller;
const {
    getSha1,
    treeToArray
} = require('../utils/index');
const uuid = require('uuid');
const moment = require('moment')

class Index extends Controller {
    async login() {
        await this.ctx.render('spa/index.xtpl', {
            title: 'user Login'
        });
    }

    async login2() {
        await this.ctx.render('user/login.xtpl', {
            title: 'user Login'
        });
    }

    /**
     * 用户注册
     */
    async regiter() {
        const { ctx } = this
        const { body } = this.ctx.request;
        const userInfo = { ...body }

        const result = {}
        const CreateTime = new Date()

        try {
            result.code = 200
            result.success = true
            if (!userInfo.openid) throw new Error("身份识别码获取异常")
            // if (!userInfo.Name) throw new Error("请填写真实姓名")
            if (!userInfo.Mobile) throw new Error("请填写手机号")

            const { Mobile } = userInfo // CheckCode
            const senior = await ctx.service.member.checkMobile(Mobile)
            
            if (senior && senior.Id) {
                // if (!CheckCode) throw new Error("请前往门店前台获取校验码以修改登记信息")

                // const datalist = await ctx.service.verification.search(userInfo)
                // if (!datalist.length) throw new Error("无效的授权码")

                // await ctx.service.verification.update({Valid: 0}, { Mobile, Code: CheckCode, Valid: 1 })

                // delete userInfo.CheckCode
                // userInfo.StoreId = datalist[0].StoreId
                const { Id } = senior
                const { openid } = userInfo
                console.log(senior)
                const card = await ctx.service.card.getByCondition({Type: 0, UserId: Id})
                if (!card) await ctx.service.card.createInit(Id)

                // 删除除了senior之外的其他openid相同的数据
                await ctx.service.member.deleteByopenid(openid, senior.Id);
                await ctx.service.member.updateFildesBy(userInfo, { Id })
                result.data = {...senior, ...userInfo}
                result.message = '修改成功'
            } else {
                console.log('create a new member')
                const entity = { ...userInfo, CreateTime, Source: 0 }
                // if (CheckCode) {
                //     const datalist = await ctx.service.verification.search(userInfo)
                //     if (!datalist.length) throw new Error("无效的授权码")

                //     await ctx.service.verification.update({Valid: 0}, { Mobile, Code: CheckCode, Valid: 1 })
                    
                //     delete userInfo.CheckCode
                //     entity.StoreId = datalist[0].StoreId
                // }
                entity.Id = uuid.v1()
                result.data = await ctx.service.member.create(entity)
                await ctx.service.card.createInit(entity.Id)
                result.message = '注册成功'
            }

            
        } catch (error) {
            console.log(error)
            ctx.logger.error(error)
            result.code = 500
            result.success = false
            result.message = error.message || '注册失败'
        }
        ctx.body = result
    }

    async logout() {
        this.ctx.session.user = null;
        await this.ctx.render('user/login.xtpl', { title: 'user Login' });
    }

    /**
     * 
     */
    async signInCourse() {
        const { ctx } = this
        const { userid } = ctx.query
        const { Id, SignTime, State } = ctx.request.body
        try {
            if (!Id || Id.length !== 36) throw new Error("参数错误")
            const reservation = await ctx.service.memberReservation.getById(Id)

            if (!reservation || !reservation.Id) throw new Error (`找不到此预约: ${Id}`)

            const { StartTime, EndTime } = reservation
            // 签到校验
            if (moment(StartTime).subtract(15, 'minutes').isAfter(moment())) throw new Error ("课程未开始") // 课程开始前十五分钟可以扫码签到
            
            if (moment(EndTime).add(3, 'hours').isBefore(moment())) throw new Error ("课程已结束")      // 课程结束三小时之内可以签到
            
            const result = await ctx.service.memberReservationExpand.editFieldsById({SignTime, State}, Id)
            ctx.body = {
                success: true,
                code: 200,
                message: result
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 454,
                message: error.message || error
            }
        }
    }

    /**
     * 获取用户会员卡信息
     */
    async card() {
        const { ctx } = this
        const { userid, type } = ctx.query
        if (!userid || typeof userid !== 'string') {
            ctx.body = {
                success: false,
                message: `登录失效, 请重新登录`,
                code: 600,
                data: {
                    token: false
                }
            }
            return
        }
        try {
            const entitylist = await ctx.service.memberExpand.getUserCardInfo({userid, type})
            ctx.body = {
                success: true,
                message: "获取会员卡信息",
                code: 200,
                data: {
                    datalist: entitylist
                }
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                message: `${error.ReferenceError || error}`,
                code: 408,
                data: {
                    token: false
                }
            }
        }
    }

    /**
     * 获取用户身体信息
     */
    async getUserBodyInfo() {
        const { ctx } = this
        const { userid } = ctx.query
        try {
            const entitylist = await ctx.service.memberExpand.getUserBodyInfo(userid)
            
            let datalist = []
            for (const key in entitylist[0]) {
                if (entitylist[0].hasOwnProperty(key) && entitylist[0][key]) {
                    const element = entitylist[0][key] ? entitylist[0][key] :null
                    datalist.push({
                        key,
                        value: element? element : null,
                        aim: entitylist[0][key] ? entitylist[0][key] : null
                    })
                }
            }
            ctx.body = {
                code: 200,
                success: false,
                message: '',
                data: {
                    datalist
                }
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                code: 506,
                success: false,
                message: `获取信息失败`
            }
        }
    }

    /**
     * 获取用户优惠券列表
     */
    async getUserCoupon() {
        const { ctx } = this
        const { userid } = ctx.query
        try {
            const entitylist = await ctx.service.memberExpand.getUserCoupon(userid)
            ctx.body = {
                code: 200,
                success: true,
                message: '',
                data:{
                    datalist: entitylist
                }
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                code: 506,
                success: false,
                message: error
            }
        }
    }

    /**
     * 微信登录接口
     */
    async wechatLogin () {
        const { ctx } = this
        const { LoginCode } = ctx.request.body
        const appid = 'wx1fe7f046ead630b6'
        const secret = '696eafc0412f275508515eb6d51d0b65'
        
        const url = {}
        const result = {
            code: 200,
            success: true
        }
        const tourist = {
            Sex: "0",
            Level: 0,
            Source: 1,
            Name: "游客",
            CreateTime: new Date(),
            CreatePerson: '小程序访客'
        }
        
        url.appid = `appid=${appid}`
        url.secret = `secret=${secret}`
        url.js_code = `js_code=${LoginCode}`
        url.base = `https://api.weixin.qq.com/sns/jscode2session`
        const wechatApi = `${url.base}?${url.appid}&${url.secret}&${url.js_code}&grant_type=authorization_code`

        try {
            const wechatResult = await ctx.curl(wechatApi , { dataType: 'json' })
            const { openid, session_key, unionid, errmsg } = wechatResult.data
            
            if (!openid) throw Error(errmsg || "cant't get openid")
            tourist.openid = openid
            tourist.unionid = unionid

            if (unionid) {
                const baseinfo = await ctx.service.migrate.pullMember(unionid)

                if (baseinfo && parseInt(baseinfo.migrate_status, 10) === 1) {
                    const { migrate_status, realname: Name, sex: Sex } = baseinfo
                    const userinfo = { ...tourist, migrate_status, Sex, Name }
                    result.message = '准备迁移用户数据'
                    result.data = { userinfo }
                    ctx.body = result
                    return 
                } else {
                    console.log('a new member coming')
                }
                
            } else {
                console.log('unionid is not defined')
            }

            const user = await ctx.service.memberExpand.getByopenid(openid)

            if (user && user.length) {
                const [ userinfo ] = user
                if (!userinfo.unionid) await ctx.service.member.updateFildesBy({unionid}, {openid})
                if (!parseInt(userinfo.Level, 10)) userinfo.Tourist = true
                result.message = '登录成功'
                result.data = { userinfo }
                ctx.body = result
                return 
            } else { // 创建新用户
                tourist.Id = uuid.v1()
                tourist.NickName = '游客'
                const res = await ctx.service.member.create(tourist)

                result.message = "登录成功"
                result.data = { userinfo: res }
                ctx.body = result
            }

        } catch (error) {
            console.error(error)
            ctx.logger.error(error)

            result.code = 500
            result.success = false
            result.message = error.message || error.ReferenceError || error

            ctx.body = result
            return
        }
    }

    /**
     * 获取用户教练记录
     */
    async getUserCoach() {
        const ctx = this.ctx
        const { userid } = ctx.query
        try {
            const entitylist = await ctx.service.memberExpand.getUserCoachHistory(userid)
            ctx.body = {
                success: true,
                code: 200,
                data: {
                    datalist: entitylist
                }
            }
            return
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 451,
                message: error,
                data: {}
            }
            return
        }
    }

    /**
     * 获取教练列表
     * 关联门店
     */
    async getCoachList() {
        const ctx = this.ctx
        const { storeid, currentType, dates } = ctx.query
        try {
            const datalist = await ctx.service.courseExpand.getCoachList(storeid, currentType, dates)
            ctx.body = {
                success: true,
                code: 200,
                data: {
                    datalist
                }
            }
            return
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 451,
                message: error,
                data: {}
            }
            return
        }
    }

    /**
     * 获取用户预约记录
     */
    async getUserReservation() {
        const ctx = this.ctx
        const { userid, State } = ctx.query
        try {
            const entitylist = await ctx.service.memberExpand.getUserReservation(userid, State)
            ctx.body = {
                success: true,
                code: 200,
                data: {
                    datalist: entitylist
                }
            }
            return
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 451,
                message: error,
                data: {}
            }
            return
        }
    }

    /**
     * 获取学员信息
     */
    async getMemberInfo() {
        const ctx = this.ctx
        const { trackingid } = ctx.query
        try {
            const entity = await ctx.service.memberExpand.getMemberInfo(trackingid)
            ctx.body = {
                success: true,
                code: 200,
                data: entity[0]
            }
            return
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 451,
                message: error
            }
            return
        }
    }

     /**
     * 获取学员信息
     * @param memberid
     */
    async getMemberInfoById() {
        const ctx = this.ctx
        const { Id } = ctx.query
        try {
            const entity = await ctx.service.memberExpand.getMemberById(Id)
            ctx.body = {
                success: true,
                code: 200,
                data: entity[0]
            }
            return
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 451,
                message: error
            }
            return
        }
    }

    /**
     * 获取会员活动列表
     */
    async getMemberActivety() {
        const ctx = this.ctx
        const { userid } = ctx.query
        try {
            const entity = await ctx.service.activityExpand.getActivityList(userid)
            let entitylist = entity
            entity.forEach((item, index) => {
                if (item.BannerList) {
                    entitylist[index].Banner = item.BannerList.split(',')[0]
                }  
            })
            ctx.body = {
                success: true,
                code: 200,
                data: {
                    datalist: entitylist
                }
            }
            return
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 452,
                message: error,
                data: {}
            }
            return
        }
    }

    /**
     * 更改用户关联门店
     */
    async setUserStore() {
        const ctx = this.ctx
        const { userid } = ctx.query
        const { storeid } = ctx.request.body
        const entity = {
            Id: userid,
            StoreId : storeid
        }
        try {
            const result = await ctx.service.memberExpand.setMemberStore(entity)
            const EntityUser = await ctx.service.member.getById(userid)
            ctx.body = {
                success: true,
                code: 200,
                message: result,
                data: EntityUser
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 100,
                message: error
            }
        }
    }

    /**
     * 教练邀请信息
     */
    async setCoachInvite() {
        const ctx = this.ctx
        const { userid } = ctx.query
        const { inviteid, state } = ctx.request.body
        const entity = {
            Id: inviteid,
            State: state
        }
        try {
            const result = await ctx.service.memberCoachInvite.edit(entity)
            ctx.body = {
                success: true,
                code: 200,
                message: result
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 100,
                message: error
            }
        }
    }

    /**
     * 获取用户资产
     */
    async getMemberAssets() {
        const ctx = this.ctx
        const { userid, coursescheduleid } = ctx.query
        try {
            const entitylist = await ctx.service.memberExpand.getMemberAssets({ userid, coursescheduleid })
            ctx.body = {
                success: true,
                code: 200,
                message: `get ${entitylist.length} assets`,
                data: {
                    datalist: entitylist
                }
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 100,
                message: error
            }
        }
    }

    /**
     * 校验、获取预约id
     */
    async checkoutResrvation() {
        const ctx = this.ctx
        const { userid, coursescheduleid } = ctx.query
        try {
            const data = await ctx.service.memberReservationExpand.checkoutResrvation({ userid, coursescheduleid })
            if (!data || !data.Id) throw new Error("你没有预约这节课")
            ctx.body = {
                success: true,
                code: 200,
                data   
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 111,
                message: error
            }
        }
    }

    async changepwd() {
        await this.ctx.render('user/changepwd.xtpl', {
            title: "更改密码"
        });
    }

    /**
     *  限制会员预约接口
     */
    async LimitMemberReservation(){
        const ctx = this.ctx
        const { UserId, TotalCancel } = ctx.request.body
        if (parseInt(TotalCancel)<=2) return
        const State = 0 // 这个是会员卡状态修改为0
        const editEntity = {
            ReservationLimited: 1, // 1 代表禁用
            LimitedTime:moment(),
            Id: UserId
        }
        try{
            const data = await ctx.service.member.edit(editEntity)
            await ctx.service.card.updateStateByUserId(State,UserId)
            ctx.body = {
                success: true,
                code: 200,
                data   
            }
        } catch (error){
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 111,
                message: error
            }
        }
    }

    async changepwdApi() {

        let editEntity = this.ctx.request.body;

        if (!editEntity.Password || !editEntity.comfirm_Password || editEntity.Password !== editEntity.comfirm_Password) {
            this.ctx.body = {
                success: false,
                message: '新密码与确认密码不一致'
            }
            return;
        }

        let {
            Id,
            Name
        } = this.ctx.session.user;
        let password = editEntity.OrginPassword;
        const user = await this.ctx.service.sysperson.getByCondition({
            Id: Id,
            Password: getSha1(password + Name)
        });


        if (!user) {
            this.ctx.body = {
                success: false,
                message: '不存在的用户或密码不正确'
            }
            return;
        }

        try {
            user.Password = getSha1(editEntity.comfirm_Password + Name);
            await this.ctx.service.sysperson.edit(user);
            this.ctx.body = {
                success: true,
                message: "成功"
            }
        } catch (ex) {
            this.ctx.body = {
                success: false,
                message: '更改密码失败'
            }
        }



    }

    /**
     * 角色权限编辑页
     */
    async roleRightEditPage() {
        const sysRoleId = this.ctx.params.Id;

        const menuTree = await this.ctx.service.userRight.getRoleRightTree(sysRoleId);
        await this.ctx.render('user/role/edit.xtpl', {
            menuTree: menuTree,
            sysRoleId
        });
    }

    /**角色编辑列表页 */
    async roleRightPage() {
        // 复制角色管理页面
        await this.ctx.render('user/role/manage.xtpl', {

        });
    }

    /**
     * 角色权限编辑接口
     */
    async roleRightEditApi() {
        try {
            const data = JSON.parse(this.ctx.request.body.data);
            const menuOprationList = treeToArray(data);
            const sysRoleId = this.ctx.request.body.sysRoleId;
            const result = await this.ctx.service.userRight.saveRoleRight(sysRoleId, menuOprationList);
            this.ctx.body = {
                success: true,
                message: "success",
                data: result
            }
        } catch (ex) {
            this.ctx.body = {
                success: false,
                message: "success",
                data: ex.toString()
            }
        }

    }

    async create() {
        const ctx = this.ctx;
        const user = await ctx.service.user.create({
            gid: 32,
            gids: '3333',
            invite_id: 12,
            user_name: 'martin',
            password: '******',
            mobile_phone: '15000875257',
            email: 'yubhbh@qq.com',
            avatar: '22',
            reg_ip: '',
            email_status: 1,
            introduce: 'hello, this is alex yu test',
            gender: 1,
            status: 1,
            status: 1,
            create_time: 1000000,
        });

        ctx.body = user;
    }

    async authRoutesApi() {
        const ctx = this.ctx;

        ctx.body = {
            "/form/advanced-form": {
                "authority": ["admin", "user"]
            }
        }
    }

    async currentUserApi() {
        const ctx = this.ctx;
        const {
            username,
            password,
            rememberMe
        } = ctx.request.body;

        ctx.body = ctx.session.user;
    }

    async getcsrfToken() {
        const ctx = this.ctx;
        ctx.cookies.set("csrfToken", ctx.session.csrfToken, {
            httpOnly: true, // 默认就是 true
            encrypt: true, // 加密传输
        });
        ctx.body = {
            success: true,
            data: ctx.session,
            message: "demo"
        }
    }

    async getCookie() {
        const ctx = this.ctx;
        ctx.cookies.set('wechat_token', uuid.v1())
        ctx.cookies.set("csrfToken", ctx.session.csrfToken, {
            httpOnly: true, // 默认就是 true
            encrypt: true, // 加密传输
        });
        ctx.body = {
            success: true,
            code: 200,
            message: "get cookie.wechat_token"
        }
    }

    // 登录/注册
    async loginApi() {
        const ctx = this.ctx;
        // ctx.body = {
        //     "status": "ok",
        //     "type": "account",
        //     "currentAuthority": "admin"
        // };
        // let user = {
        //     "name": "Serati Ma",
        //     "avatar": "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
        //     "userid": "00000001",
        //     "email": "antdesign@alipay.com",
        //     "signature": "海纳百川，有容乃大",
        //     "title": "交互专家",
        //     "group": "蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED",
        //     "tags": [{
        //         "key": "0",
        //         "label": "很有想法的"
        //     }, {
        //         "key": "1",
        //         "label": "专注设计"
        //     }, {
        //         "key": "2",
        //         "label": "辣~"
        //     }, {
        //         "key": "3",
        //         "label": "大长腿"
        //     }, {
        //         "key": "4",
        //         "label": "川妹子"
        //     }, {
        //         "key": "5",
        //         "label": "海纳百川"
        //     }],
        //     "notifyCount": 12,
        //     "unreadCount": 11,
        //     "country": "China",
        //     "geographic": {
        //         "province": {
        //             "label": "浙江省",
        //             "key": "330000"
        //         },
        //         "city": {
        //             "label": "杭州市",
        //             "key": "330100"
        //         }
        //     },
        //     "address": "西湖区工专路 77 号",
        //     "phone": "0752-268888888"
        // }
        // ctx.session.user = user;
        // return;

        try {
            const user = await ctx.service.sysperson.getByCondition({
                Name: username,
                Password: getSha1(password + username)
            });

            if (!user) {
                ctx.body = {
                    success: false,
                    data: {
                        isLogin: false
                    },
                    message: '用户名和密码不正确'
                }
            } else {
                // 设置 Session
                ctx.session.user = user;
                // 如果用户勾选了 `记住我`，设置 30 天的过期时间
                // if (rememberMe) ctx.session.maxAge = ms('30d');
                ctx.body = {
                    success: true,
                    data: {
                        isLogin: true
                    }
                }

            }
            try {
                let ip = this.ctx.ip,
                    userAgnet = this.ctx.request.header["user-agent"],
                    WebBrowser = userAgnet.match(/(firefox|edge|opera|opr|chrome|safari|msie|trident)\/[\d.]+/gi);

                let loginEntity = {
                    Id: uuid.v4(),
                    SysPersonId: user.Id,
                    IP: ip,
                    WebBrowser: WebBrowser[0].split('/')[0],
                    WebBrowserVersion: WebBrowser[0].match(/[\d]+/)[0],
                    Valid: 1,
                    CreateTime: new Date(),

                };
                await this.ctx.service.cnhSyspersonloginlog.create(loginEntity);

            } catch (err) {
                console.log(err);
            }


        } catch (ex) {
            ctx.logger.error('登录异常', ex)
            ctx.body = {
                success: false,
                data: {
                    isLogin: false
                },
                message: "系统繁忙"
            }
        }

    }

    async getCoupon() {
        const { ctx } = this
        const { body } = ctx.request
        const { UserId, Id } = body
        try {
            const result = await ctx.service.memberCoupon.Distribution(Id, UserId)
            if (!result || !result.length) {
                ctx.body = {
                    success: false,
                    code: 200,
                    message: "优惠卷已失效"
                }
                return
            }
            if (result.findIndex(item => item.UserId === UserId) >= 0) {
                ctx.body = {
                    success: false,
                    code: 200,
                    message: "你已经领取过这张优惠卷了"
                }
                return
            }
            const res_edit = await ctx.service.memberCoupon.setUserId({
                UserId,
                CouponId: result[0].Id
            })
            console.log(res_edit)
            // todo 校验是否领取成功
            ctx.body = {
                success: true,
                code: 200,
                message: "优惠卷领取成功"
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 500,
                data: error,
                message: "领取异常"
            }
        }
    }

    async getUserDetailById() {
        const { ctx } = this
        const { userid } = ctx.query
        try {
            const $result = await ctx.service.memberExpand.getUserDetailById(userid)
            if (!$result.length) {
                ctx.body = {
                    success: false,
                    code: 200,
                    message: "更新失败"
                }
            }
            const userinfo = $result[0]
            ctx.body = {
                success: true,
                message: "更新用户数据",
                code: 200,
                data: { userinfo }
            }
        } catch (error) {
            console.error(error)
            ctx.logger.error(error)
            ctx.body = {
                success: false,
                code: 500,
                message: "服务异常"
            }
        }
    }

}

module.exports = Index;
