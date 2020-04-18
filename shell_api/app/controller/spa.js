'use strict';

const Controller = require('egg').Controller;
const moment = require("moment");
const utils = require('../utils/index');
class Home extends Controller {

  

    async index() {
        let menu = [];
    
        await this.ctx.render('spa/index.xtpl', {
            menu
        });
    }
 
 
}


module.exports = Home;
