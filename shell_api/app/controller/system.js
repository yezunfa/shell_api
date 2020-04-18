'use strict';

const Controller = require('egg').Controller;

class Index extends Controller {


    async Config() {
        const pid = 0;
        const dictionary = await this.ctx.service.system.getDictonary(pid);

        let reslut = {
            success: true,
            data: {
                dictionary
            }
        }
        this.ctx.body = reslut;
    }


    async Base() {

        this.ctx.body = {
            "employeePositionList": [{
                "id": "100001",
                "name": "董事"
            }, {
                "id": "100002",
                "name": "总监"
            }, {
                "id": "100003",
                "name": "经理"
            }, {
                "id": "100004",
                "name": "组长"
            }],
            "employeeRoleList": [{
                "id": "100001",
                "name": "教练"
            }, {
                "id": "100002",
                "name": "销售"
            }],
            "identityList": [{
                "id": "card_100001",
                "name": "身份证"
            }, {
                "id": "card_100002",
                "name": "军官证"
            }, {
                "id": "card_100003",
                "name": "驾驶证"
            }, {
                "id": "card_100004",
                "name": "港澳台通行证"
            }],
            "educationList": [{
                "id": "100001",
                "name": "小学"
            }, {
                "id": "100002",
                "name": "中学"
            }, {
                "id": "100003",
                "name": "中专"
            }, {
                "id": "100004",
                "name": "本科"
            }, {
                "id": "100005",
                "name": "硕士"
            }, {
                "id": "100006",
                "name": "博士"
            }, {
                "id": "100007",
                "name": "博士后"
            }]
        }
    }

    async dictionary() {
        const pid = 0;
        const dictionary = await this.ctx.service.system.getDictonary(pid);
        let reslut = {
            code: 200,
            success: true,
            data: {
                dictionary
            }
        }
        this.ctx.body = reslut;
    }

    async getsystemlog () {
        const { ctx } = this
        const { userid } = ctx.query
        try {
            const response = await ctx.service.sysLog.searchbyuser(userid)
            const [ data ] = response
            ctx.body = {
                data,
                success: true,
                message: '',
                code: 200
            }
        } catch (error) {
            const { message } = error
            ctx.body = { code: 500, data: {}, success: false, message }
        }
    }

}

module.exports = Index;
