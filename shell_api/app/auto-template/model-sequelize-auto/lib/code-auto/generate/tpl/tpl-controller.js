'use strict';
const uuid = require('uuid');
// require

const Controller = require('egg').Controller;

class __Tablename__ extends Controller {

  /**
   * 搜索__Tablename__
   * 通过ctx.request.query的url参数查询, 参数用JSON.stringify处理
   * ?pagination={current: 1, pageSize: 10}
   * ?query={Valid: 1}
   * ?sort={Sort: 'DESC'}
   * 
   */
  async searchByApi() {

    // 默认分页
    let pagination = {
      current: 1,
      pageSize: 10
    };
    
    // 查询
    let query = null;

    // 排序
    let sort = null;
    try {
      let reqPagination = this.ctx.request.query["pagination"];
      if (reqPagination) {
        reqPagination = JSON.parse(reqPagination);
        pagination = Object.assign(pagination, reqPagination)
      }
    } catch (ex) {
      this.ctx.logger.error('__Tablename__.searchByApi调用参数异常/pagination', ex);
      this.ctx.body = {
        success: false,
        msg: 'pagination参数错误',
        code: 500
      }
      return;
    }

    try {
      let reqQuery = this.ctx.request.query["query"];
      if (reqQuery) {
        reqQuery = JSON.parse(reqQuery);
        query = Object.assign({}, reqQuery)
      }
    } catch (ex) {
      this.ctx.logger.error('__Tablename__.searchByApi调用参数异常/query', ex);
      this.ctx.body = {
        success: false,
        msg: 'query参数错误',
        code: 500
      }
      return;
    }

    try {
      let reqSort = this.ctx.request.query["sort"];
      if (reqSort) {
        reqSort = JSON.parse(reqSort);
        sort = Object.assign({}, reqSort)
      }
    } catch (ex) {
      this.ctx.logger.error('__Tablename__.searchByApi调用参数异常/sort', ex);
      this.ctx.body = {
        success: false,
        msg: 'sort参数错误',
        code: 500
      }
      return;
    }

    try {
      // where 条件
      const entityList = await this.ctx.service.__servicename__.search(pagination, query, sort);

      let reslut = {
        success: true,
        data: {
          dataList: entityList.rows,
          total: entityList.count, // 总条目数
          totalPage: Math.ceil(entityList.count/pagination.pageSize), // 总页数
          pageSize: pagination.pageSize, // 分页标准
          currentPage: pagination.current, // 当前所在页数（从1开始）
        }
      }
      this.ctx.body = reslut;

    } catch (ex) {
      this.ctx.logger.error('__Tablename__.searchByApi调用异常/__servicename__.search', ex);
      this.ctx.body = {
        success: false,
        code: 500,
        msg: '系统异常'
      }
    }

  }

  /**
   * 创建一条__Tablename__记录
   * 从ctx.request.body取得Post过来的数据，然后validateAndFormat验证
   */
  async createByApi() {
    let newEntity = this.ctx.request.body;
    newEntity.Id = uuid.v4();
    newEntity.CreateTime = Date.now();
    newEntity.CreatePerson = this.ctx.session.user.Id;
    newEntity.UpdatePerson = this.ctx.session.user.Id;
    newEntity.UpdateTime = Date.now();

    try {
      newEntity = this.ctx.validateAndFormat(newEntity, '__tablename__');
    } catch (ex) {
      this.ctx.logger.error('__Tablename__.createByApi调用异常/validateAndFormat', ex);
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
        code: 200,
        data: entity,
      }
    } catch (ex) {
      this.ctx.logger.error('__Tablename__.createByApi调用异常/__servicename__.create', ex);
      this.ctx.body = {
        success: false,
        message: ex,
        code: 500,
        data: newEntity
      }
    }
  }

  /**
   * 编辑一条__Tablename__记录
   * 从ctx.request.body取得Post过来的数据，然后validateAndFormat验证
   */
  async editByApi() {

    let editEntity = this.ctx.request.body;
    editEntity.UpdateTime = Date.now();
    editEntity.CreatePerson = this.ctx.session.user.Id;
    editEntity.UpdatePerson = this.ctx.session.user.Id;

    try {
      editEntity = this.ctx.validateAndFormat(editEntity, '__tablename__');
    } catch (ex) {
      this.ctx.logger.error('__Tablename__.editByApi调用异常/validateAndFormat', ex);
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
        code: 200,
        data: entity
      }
    } catch (ex) {
      this.ctx.logger.error('__Tablename__.editByApi调用异常/__servicename__.edit', ex);
      this.ctx.body = {
        success: false,
        code: 500,
        message: ex,
        data: editEntity
      }
    }
  }

  /**
   * 获取一条__Tablename__记录详情
   */
  async getByApi() {
    try {
      
      const Id = this.ctx.params.Id;
      if (!Id) {
        this.ctx.body = {
          success: false,
          message: "参数不完整"
        }
        return;
      }

      let entity = null;
      try {
        entity = await this.ctx.service.__servicename__.getById(Id);
      } catch (ex) {
        this.ctx.logger.error('__Tablename__.getByApi调用异常/__servicename__.getById', ex);
        this.ctx.body = {
          success: false,
          message: ex.message,
          data: entity
        }
        return;
      }

      entity = this.ctx.formatEntiy(entity, '__tablename__')
      this.ctx.body = {
        success: true,
        code: 200,
        data: entity
      }
    } catch (ex) {
      this.ctx.logger.error('__Tablename__.getByApi调用异常/formatEntiy', ex);
      this.ctx.body = {
        success: false,
        code: 500,
        message: ex.message
      }
    }

  }

  /**
   * 获取表中的最新记录
   */
  async getLatestApi() {
    try {
      let entity = await this.ctx.service.__servicename__.getLatest();
      try {
        entity = this.ctx.formatEntiy(entity, '__tablename__')
      } catch (ex) {
        this.ctx.logger.error('__Tablename__.getLatestApi调用异常/formatEntiy', ex);
        this.ctx.body = {
          success: false,
          message: ex.message,
          code: 500,
          data: entity
        }
        return;
      }
      this.ctx.body = {
        success: true,
        code: 200,
        data: entity
      }
    } catch (ex) {
      this.ctx.logger.error('__Tablename__.getLatestApi调用异常/getLatest', ex);
      this.ctx.body = {
        success: false,
        code: 500,
        message: ex.message
      }
    }

  }

  async removeByApi() {
    try {
      const reqBody = this.ctx.request.body;
      const Id = reqBody.Id;
      if (!Id) {
        this.ctx.body = {
          success: false,
          data: "参数不完整"
        }
        return;
      }
      const entity = await this.ctx.service.__servicename__.getById(Id);
      entity.UpdateTime = Date.now();
      if (!entity) {
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
    } catch (ex) {
      this.ctx.body = {
        success: false,
        message: ex.message
      }
    }
  }

  async deleteByApi() {
    try {
      const reqBody = this.ctx.request.body;
      const Id = reqBody.Id;
      if (!Id) {
        this.ctx.body = {
          success: false,
          data: "参数不完整"
        }
        return;
      }
      const entity = await this.ctx.service.__servicename__.getById(Id);
      entity.UpdateTime = Date.now();
      const affact = await this.ctx.service.__servicename__.remove(entity);
      this.ctx.body = {
        success: true,
        code: 200,
        data: affact
      }
    } catch (ex) {
      this.ctx.logger.error('__Tablename__.deleteByApi调用异常/remove', ex);
      this.ctx.body = {
        success: false,
        message: ex.message
      }
    }
  }

}

module.exports = __Tablename__;