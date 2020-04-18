'use strict';

const Controller = require('egg').Controller;

class MadingyuHome extends Controller {


    /**
     * 马丁鱼首页 已经放到home里面判断了
     */
    async index() {
        // await this.ctx.render('code/home.xtpl', {  });
        // await this.ctx.render('madingyu/index.xtpl', {});
    }

}

module.exports = MadingyuHome;
