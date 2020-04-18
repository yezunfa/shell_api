'use strict';

/**
 * 代码页面管理服务
 * useage: ctx.service.mEvent.index.create
 */

const Service = require('egg').Service;
const uuid = require('uuid');

class IndexService extends Service {

    /**
     * 获取发页的页面
     */
    async getPage(pageInfo) {
        
        try {
            
            if(!pageInfo || !pageInfo.Id || !pageInfo.Url) {
                return {
                    success: false,
                    message: '参数报错'
                }
            }
          
            const whereCon = {}
            if(pageInfo.Id) {
                whereCon.Id = pageInfo.Id;
            } else {
                whereCon.Url = pageInfo.Url;
            }
            // 用await this.ctx.model.
            let page = await this.ctx.model.MAppPage.findOne({
                where: whereCon ,
                raw: true // 如果没有这个，下面要用event.dataValues
            })
        
            return {
                success: true,
                data: page
            }

        } catch (ex) {
            this.ctx.logger.error('获取接口详情异常:', ex)
            return {
                success: false,
                data: null,
                code: 500,
                message: '系统错误'
            }
        }

    }

    /**
     * 创建或编辑页面
     * @param {Object} pageData 
     */
    async pageSave(pageData) {
        
        const existPage = await this.ctx.model.MAppPage.findOne({
            where: {
                Url: pageData.Url
            } ,
            raw: true // 如果没有这个，下面要用event.dataValues
        });

        // 新建 || 编辑 页面Url不能重复
        if((!pageData.Id  && existPage && existPage.Id) || 
            (pageData.Id  && existPage && existPage.Id !== pageData.Id)) {
            return {
                success: false, 
                message: `页面Url不能重复:${pageData.Url}`
            }
        }


        try {
            // 事务定义方式：创建活动放在一个事务中,任务报错都会回滚
            let currentTransaction = async (trans) => {

                let page = null;

                // 保存数据到history表
                if(pageData.Id) {
                    page = await this.ctx.model.MAppPage.findOne({
                        where: {
                            Id: pageData.Id
                        } ,
                        raw: true // 如果没有这个，下面要用event.dataValues
                    });
                    if(!page) {
                        const res = {
                            success: false,
                            message: "保存的页面Id不存在"
                        }
                        return res;
                    } else {
                        const pageHistory = page;
                        pageHistory.Id = uuid.v4(); // 新生一个
                        pageHistory.PageId = pageData.Id
                        pageHistory.IsPublish = 0;
                        pageHistory.CreateTime = Date.now();
                        pageHistory.CreatePerson = "dev";// sesion
                        try{
                            await this.ctx.model.MAppPageHistory.create(pageHistory, 
                             { transaction: trans }
                            )
                        } catch(ex) {
                            const res = {
                                success: false,
                                message: "保存到历史记录报错"
                            }
                            this.ctx.logger.error(res, ex)
                            throw ex;
                        }
                        
                    }
                }
                

                // 有Id 则更新，无则创建
                if(page) {
                    console.log(pageData.Content);
                    page.Id = pageData.Id; // 重置被history引用了。
                    page.UpdateTime = Date.now();
                    page.UpdatePerson = 'dev';
                    page.Content = pageData.Content;
                    page.Url = pageData.Url;
                    page.Name = pageData.Name;
                    try{
                       const res = await this.ctx.model.MAppPage.update(page, {
                        where: {
                            Id: page.Id
                        },
                        transaction: trans
                       });
                       return {
                           success: true,
                           data: res
                       }
                    } catch(ex) {
                        const res = {
                            success: false,
                            message: "保存记录报错"
                        }
                        this.ctx.logger.error(res, ex)
                        throw res;
                    }
                } else {
                    // 新增
                    const page = pageData;
                    page.Id = uuid.v4();
                    page.Valid = 1;
                    page.CreateTime = Date.now();
                    page.CreatePerson = 'dev';
                    const res = await this.ctx.model.MAppPage.create(page , 
                       { transaction: trans }
                    );
                    return {
                        success: true,
                        data: res
                    }
                }
            }

            // 开始事务
            let createOrUpdateResult = await this.ctx.model.transaction(currentTransaction);
            return createOrUpdateResult;


        } catch (err) {
            this.ctx.logger.error('保存代码接口异常', err)
            return {
                success: false,
                code: 500,
                message: '系统错误'
            }
        }
    }

    /**
     * 发布页面
     * @param {Object} pageData 
     */
    async pagePublish(pageData) {
        
        try {
            // 事务定义方式：创建活动放在一个事务中,任务报错都会回滚
            let currentTransaction = async (trans) => {

                // 保存数据到history表
                if(pageData.Id) {
                    const page = await this.ctx.model.MAppPage.findOne({
                        where: {
                            Id: pageData.Id
                        } ,
                        raw: true
                    });

                    if(!page) {
                        const res = {
                            success: false,
                            message: "要发布的页面不存在"
                        }
                        return res
                    }
               
                    page.Id = uuid.v4();
                    page.PageId = pageData.Id
                    page.IsPublish = 1;
                    page.CreateTime = Date.now();
                    page.CreatePerson = "dev";// sesion
                    try{
                        const res =await this.ctx.model.MAppPageHistory.create(page, 
                             { transaction: trans }
                            );
                        return{
                            success: true,
                            message: '发布成功',
                            data: res
                        }
                    } catch(ex) {
                        const res = {
                            success: false,
                            message: "发布出错"
                        }
                        this.ctx.logger.error(res, ex)
                        return res
                    }
                   
                }
            }

            // 开始事务
            let createOrUpdateResult = await this.ctx.model.transaction(currentTransaction);
            return createOrUpdateResult;


        } catch (err) {
            this.ctx.logger.error('保存代码接口异常', err)
            return {
                success: false,
                code: 500,
                message: '系统错误'
            }
        }
    }

    /**
     * 获取发页的页面
     */
    async getRenderPage(pageInfo) {
        console.log(".pageInfopageInfo.....",pageInfo)
        try {
            
            if(!pageInfo) {
                return {
                    success: false,
                    message: '参数报错'
                }
            }
            let  whereCon ={ 
                IsPublish: 1
            }
            if(pageInfo.Id) {
                whereCon.PageId = pageInfo.Id;
            } else {
                whereCon.Url = pageInfo.Url;
            }

            console.log("......",whereCon)
            // 用await this.ctx.model.
            let page = await this.ctx.model.MAppPageHistory.findOne({
                where: whereCon ,
                order: [["CreateTime", 'DESC']],
                raw: true // 如果没有这个，下面要用event.dataValues
            })
        
            return {
                success: true,
                data: page
            }
            

        } catch (ex) {
            this.ctx.logger.error('获取接口详情异常:', ex)
            return {
                success: false,
                data: null,
                code: 500,
                message: '系统错误'
            }
        }

    }
   
     /**
     * 获取页面列表
     */
    async getPageList() {
        try {
            // 用await this.ctx.model.
            let pageList = await this.ctx.model.MAppPage.findAll({
                where: {} ,
                order: [["CreateTime", 'DESC']],
                raw: true // 如果没有这个，下面要用event.dataValues
            })
        
            return {
                success: true,
                data: pageList
            }
            

        } catch (ex) {
            this.ctx.logger.error('获取接口详情异常:', ex)
            return {
                success: false,
                data: null,
                code: 500,
                message: '系统错误'
            }
        }

    }
}

module.exports = IndexService;
