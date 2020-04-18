'use strict';
const uuid = require('uuid');
// require

const Controller = require('egg').Controller;

class __Tablename__ extends Controller {

  async searchByApi() {
    // 获取用户当前请求Url的操作权限
    let $userOperation = await this.ctx.service.userRight.getCurUserOperation();

    if(!$userOperation.Search || !$userOperation.Search.enable) {
      this.ctx.body = {
        success: false,
        code: 403,
        message: "需要授权"
      }
      // return; 权限需要添加，先注释
    }

    let pagination = {
      current: 1,
      pageSize: 10
    };
    let query = null;
    let sort = null;
    try{
      let reqPagination = this.ctx.request.query["pagination"];
      if(reqPagination) {
        reqPagination = JSON.parse(reqPagination);
        pagination = Object.assign(pagination, reqPagination)
      }
    } catch(ex) {
      console.log('pagination params ex', ex)
    }

    try{
      let reqQuery = this.ctx.request.query["query"];
      if(reqQuery) {
        reqQuery = JSON.parse(reqQuery);
        query = Object.assign({}, reqQuery)
      }
    } catch(ex) {
      console.log('reqQuery params ex', ex)
    }

    try{
      let reqSort= this.ctx.request.query["sort"];
      if(reqSort) {
        reqSort = JSON.parse(reqSort);
        sort = Object.assign({}, reqSort)
      }
    } catch(ex) {
      console.log('reqQuery params ex', ex)
    }
  
    // where 条件
    const entityList = await this.ctx.service.__servicename__.joinSearch(pagination, query, sort);
    
    // isTreeReplacer
    let reslut = {
      success: true,
      totalCount: entityList.count,
      data: entityList.rows
    }
    this.ctx.body = reslut;
  }

  async createByApi() {

    // 获取用户当前请求Url的操作权限
    let $userOperation = await this.ctx.service.userRight.getCurUserOperation();

    if(!$userOperation.Create || !$userOperation.Create.enable) {
      this.ctx.body = {
        success: false,
        code: 403,
        message: "需要授权"
      }
      // return; 权限需要添加，先注释
    }

    let newEntity = this.ctx.request.body;
    newEntity.Id = uuid.v4();
    newEntity.CreateTime = Date.now();
    newEntity.CreatePerson = this.ctx.session.user.Id;
    newEntity.UpdatePerson = this.ctx.session.user.Id;
    newEntity.CreateTime = Date.now();

    try {
      newEntity = this.ctx.validateAndFormat(newEntity, '__tablename__');
    } catch(ex) {
      this.ctx.body = {
        success: false,
        code: 413,
        message: ex.message,
        data: newEntity,
      }
      return;
    }

    try {
      const entity = await this.ctx.service.__servicename__.create(newEntity);
      this.ctx.body = {
        success: true,
        data: entity,
      }
    } catch(ex) {
      this.ctx.body = {
        success: false,
        message: ex,
        data: newEntity
      }
    }
  }

  async editByApi() {
    // 获取用户当前请求Url的操作权限
    let $userOperation = await this.ctx.service.userRight.getCurUserOperation();

    if(!$userOperation.Save || !$userOperation.Save.enable) {
      this.ctx.body = {
        success: false,
        code: 403,
        message: "需要授权"
      }
      // return; 权限需要添加，先注释
    }

    let editEntity = this.ctx.request.body;
    editEntity.UpdateTime = Date.now();
    editEntity.CreatePerson = this.ctx.session.user.Id;
    editEntity.UpdatePerson = this.ctx.session.user.Id;

    try {
      editEntity = this.ctx.validateAndFormat(editEntity, '__tablename__');
    } catch(ex) {
      this.ctx.body = {
        success: false,
        code: 413,
        message: ex.message,
        data: editEntity,
      }
      return;
    }

    try {
      const entity = await this.ctx.service.__servicename__.edit(editEntity);
      this.ctx.body = {
        success: true,
        data: entity
      }
    } catch(ex) {
      this.ctx.body = {
        success: false,
        message: ex,
        data: editEntity
      }
    }
  }

  async getByApi() {
    try{
      // 获取用户当前请求Url的操作权限
      let $userOperation = await this.ctx.service.userRight.getCurUserOperation();

      if(!$userOperation.Detail || !$userOperation.Create.Detail) {
        this.ctx.body = {
          success: false,
          code: 403,
          message: "需要授权"
        }
        // return; 权限需要添加，先注释
      }

      const Id = this.ctx.params.Id;
      if(!Id) {
        this.ctx.body = {
          success: false,
          message: "参数不完整"
        }
        return;
      }
    
      let entity = await this.ctx.service.__servicename__.getById(Id);
      try {
        entity = this.ctx.formatEntiy(entity, '__tablename__')
      } catch(ex) {
        this.ctx.body = {
          success: false,
          message: ex.message,
          data: entity
        }
        return;
      }
      this.ctx.body = {
        success: true,
        data: entity
      }
    } catch (ex) {
      this.ctx.body = {
        success: false,
        message: ex.message
      }
    }
    
  }

  /**
   * 获取表中的最新记录
   */
  async getLatestApi() {
    try{
      // 获取用户当前请求Url的操作权限
      let $userOperation = await this.ctx.service.userRight.getCurUserOperation();

      if(!$userOperation.Detail || !$userOperation.Create.Detail) {
        this.ctx.body = {
          success: false,
          code: 403,
          message: "需要授权"
        }
        // return; 权限需要添加，先注释
      }

    
      let entity = await this.ctx.service.__servicename__.getLatest();
      try {
        entity = this.ctx.formatEntiy(entity, '__tablename__')
      } catch(ex) {
        this.ctx.body = {
          success: false,
          message: ex.message,
          data: entity
        }
        return;
      }
      this.ctx.body = {
        success: true,
        data: entity
      }
    } catch (ex) {
      this.ctx.body = {
        success: false,
        message: ex.message
      }
    }
    
  }

  async removeByApi() {
    try {
      // 获取用户当前请求Url的操作权限
      let $userOperation = await this.ctx.service.userRight.getCurUserOperation();

      if(!$userOperation.Delete || !$userOperation.Create.Delete) {
        this.ctx.body = {
          success: false,
          code: 403,
          message: "需要授权"
        }
        // return; 权限需要添加，先注释
      }

      const reqBody = this.ctx.request.body;
      const Id = reqBody.Id;
      if(!Id) {
        this.ctx.body = {
          success: false,
          data: "参数不完整"
        }
        return;
      }
      const entity = await this.ctx.service.__servicename__.getById(Id);
      entity.UpdateTime = Date.now();
      if(!entity) {
        this.ctx.body = {
          success: false,
          data: "不存在此记录"
        }
        return;
      }
      const affact = await this.ctx.service.__servicename__.remove(entity);
      this.ctx.body = {
        success: true,
        data: affact
      }
    } catch(ex) {
      this.ctx.body = {
        success: false,
        message: ex.message
      }
    } 
  }

  async deleteByApi() {
    try {
      // 获取用户当前请求Url的操作权限
      let $userOperation = await this.ctx.service.userRight.getCurUserOperation();

      if(!$userOperation.Delete || !$userOperation.Create.Delete) {
        this.ctx.body = {
          success: false,
          code: 403,
          message: "需要授权"
        }
        // return; 权限需要添加，先注释
      }
      const reqBody = this.ctx.request.body;
      const Id = reqBody.Id;
      if(!Id) {
        this.ctx.body = {
          success: false,
          data: "参数不完整"
        }
      }
      const entity = await this.ctx.service.__servicename__.getById(Id);
      entity.UpdateTime = Date.now();
      const affact = await this.ctx.service.__servicename__.remove(entity);
      this.ctx.body = {
        success: true,
        data: affact
      }
    } catch(ex) {
      this.ctx.body = {
        success: false,
        message: ex.message
      }
    } 
  }

}

module.exports = __Tablename__;