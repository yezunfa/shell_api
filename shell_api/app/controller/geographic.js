'use strict';

const Controller = require('egg').Controller;

class Index extends Controller {

  

    async province() {
        const pid = 0;
        const areaList = await this.ctx.service.geographic.getArea(pid);

        let reslut = {
          success: true,
          data: {
              list: areaList
          }
        }
        this.ctx.body = reslut;
    }
 
    async city() {
        const pid = this.ctx.params.province;
        const areaList = await this.ctx.service.geographic.getArea(pid);

        let reslut = {
          success: true,
          data: {
              list: areaList
          }
        }
        this.ctx.body = reslut;
    }

    async area() {
        const pid = this.ctx.params.city;
        const areaList = await this.ctx.service.geographic.getArea2(pid);

        let reslut = {
          success: true,
          data: {
              list: areaList
          }
        }
        this.ctx.body = reslut;
    }
 
}

module.exports = Index;
