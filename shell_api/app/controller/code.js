'use strict';

const Controller = require('egg').Controller;

class Index extends Controller {

    async home() {
        console.log( this.ctx.session.codeUser,' this.ctx.session.codeUser')
        await this.ctx.render('code/home.xtpl', {  });
  
    }


    // 登录
    async login() {
        this.ctx.session.codeUser = null;
        await this.ctx.render('code/home.xtpl', {  });
    }

    // login api
    async loginApi() {
        const pageData = this.ctx.request.body;
        console.log(pageData    )
        if(pageData.loginName === 'mdy2020' &&  pageData.loginPassword === 'mdy;2020') {
            this.ctx.session.codeUser = {
                loginName: pageData.loginName,
            }
            this.ctx.body = {
                success: true,
                loginName: pageData.loginName,
            }
        } else {
            this.ctx.body =  {
                success: false,
                message: "账号密码错误"
            }
        }
         
    }

    // 打开页面编辑器
    async page() {
        const ctx = this.ctx;
        const pageInfo = {
            Id: this.ctx.query.Id,
            Url: this.ctx.request.url
        }
        console.log(pageInfo);
        const res = await this.ctx.service.code.index.getPage(pageInfo);
        const pageData = res ? res.data : {};
        console.log(pageData)
        await this.ctx.render('code/page.xtpl', { pageData });
        
    }

    async pageSave() {
        // todo 权限配置
        // todo 入参验证安全
        const pageData = this.ctx.request.body;
        try{
            const res = await this.ctx.service.code.index.pageSave(pageData);
            this.ctx.body =  res;
        } catch(ex) {
            this.ctx.body = {
                success: false,
                message: "系统异常"
            }
        }
        
    }

    async pagePublish() {
          // todo 权限配置
        // todo 入参验证安全
        const pageData = this.ctx.request.body;
        try{
            const res = await this.ctx.service.code.index.pagePublish(pageData);
            this.ctx.body = res
        } catch(ex) {
            this.ctx.body = {
                success: false,
                message: "系统异常"
            }
        }
    }


    async pageList() {
        const pageInfo = {
            Id: this.ctx.query.Id,
            Url: this.ctx.request.url
        }
        console.log(pageInfo);
        try{
            const res = await this.ctx.service.code.index.getPageList();
            const pageData = res ? res.data : {};
            await this.ctx.render('code/pageList.xtpl', { pageData } );
        } catch(ex) {
            this.ctx.body = {
                success: false,
                message: "系统异常"
            }
        }

       
    }

    async pageRender() {
       

        try{
            const pageInfo = {
                Id: this.ctx.query.Id,
                Url: this.ctx.request.url.split('?')[0].split('/')[2]
            }
            console.log(pageInfo,'dddddd');
            const res = await this.ctx.service.code.index.getRenderPage(pageInfo);
            // todo use redis to return 
            if(res.success) {
                const pageData = res && res.data ? res.data : {};
                this.ctx.body = pageData.Content || "页面没有发布!!";
                // await this.ctx.render('code/render.xtpl', { pageData } );
            } else {
                this.ctx.body = "获取数据异常";
            }
           
        } catch(ex) {
            this.ctx.logger.error(ex, '系统异常')
            this.ctx.body = {
                success: false,
                message: "系统异常"
            }
        }

       
    }


    

}

module.exports = Index;