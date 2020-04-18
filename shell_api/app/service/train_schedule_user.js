'use strict';

/**
 * TrainScheduleUserService
 * useage: ctx.service.train_schedule_user
 */
const { sqlHelper, sqlMango } = require('../utils/index');
const Service = require('egg').Service;

class TrainScheduleUserService extends Service {
    ServiceConfig () {
        const TrainSchedule = `select 
        train_schedule_user.*
        from train_schedule_user`
        const Table = { TrainSchedule }
        return { Table }
    }
    
    /**
     * search in TrainScheduleUser and left jion with {  }
     * @param {Object} pagination page 
     * @param {Object} where where
     * @param {Object} order order by  
     * @returns {Object} list 
     */
    async searchSchedule({$pagination, $query, $sort}) {
        const { ctx } = this
        const { current, pageSize, disabled } = $pagination

        const sql = type => {
            switch (type) {
                case "Count":
                    return `select count(ViewTable.Id) as count
                    from (${this.ServiceConfig().Table.TrainSchedule}) as ViewTable
                    ${sqlMango.buildWhereCondition($query, 'ViewTable')}`
                default:
                    const { condition, order, limit } = sqlMango.buildCondition($pagination, $query, $sort, 'ViewTable');
                    return `select ViewTable.*
                    from (${this.ServiceConfig().Table.TrainSchedule}) as ViewTable
                    ${condition}
                    ${order ? order : ""}
                    `
            }
        }

        try {
            const type = ctx.model.Sequelize.QueryTypes.SELECT
            
            const countResult = await ctx.model.query(sql("Count"), { type });
            const dataList = await ctx.model.query(sql(), { type });

            const total = countResult.length ? countResult[0].count : 0
            return { current, pageSize, total, dataList }
        } catch (error) {
            throw new Error(error)
        }        
    }
    
    /**
     * create a new train_schedule_user
     * @param {Object} entity model train_schedule_user
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.TrainScheduleUser.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a train_schedule_user by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById({Reservationid,userid}) {
        try {
            let result = await this.ctx.model.TrainScheduleUser.findAll({
                where: {
                    UserId:userid
                },
                order: [['CreateTime', 'desc']]
            });
            
            if(result[0]  && result[0].dataValues) {
                const Id = result[0].dataValues.Id
                result = JSON.parse(JSON.stringify(result[0]))
                // 阶段
                result.Phase =  await this.ctx.model.TrainSchedulePhase.findAll({
                    where: {
                        TrainScheduleId: Id,
                        Type: 'Phase'
                    },
                    order: [['Sort', 'asc']]
                });
                
                if(result.Phase && result.Phase.length) {
                    result.Phase = JSON.parse(JSON.stringify(result.Phase));
                    // 天
                    for(var i=0; i< result.Phase.length; i++) {
                        const phase = result.Phase[i];
                        // 每一个阶段的每一个训练天
                        phase.Days = await this.ctx.model.TrainSchedulePhase.findAll({
                            where: {
                                ParentId: phase.Id,
                                Type: 'Days'
                            },
                            order: [['Sort', 'asc']]
                        });
                        // 当前预约的训练天
                        phase.Nowadays = await this.ctx.model.TrainSchedulePhase.findAll({
                            where: {
                                ParentId: phase.Id,
                                Reservationid:Reservationid,
                                Type: 'Days'
                            },
                            order: [['Sort', 'asc']]
                        });
                        if(phase.Days && phase.Days.length) {
                            phase.Days = JSON.parse(JSON.stringify(phase.Days));
                            // 分类
                            for(var j=0; j< phase.Days.length; j++) {
                                const day = phase.Days[j];
                                day.PhaseName = phase.Name   // 将该天所属的阶段名称传值到当天的数据中去
                                const sql = `select * from train_schedule_phase
                                where ParentId ='${day.Id}' 
                                and Type = 'Catogory' `
                                day.Catogory = await this.ctx.model.query(sql, {
                                    type: this.ctx.model.Sequelize.QueryTypes.SELECT
                                })
                            }
                        }
                        // 给当前预约添加训练项目
                        if(phase.Nowadays && phase.Nowadays.length) {
                            phase.Nowadays = JSON.parse(JSON.stringify(phase.Nowadays));
                            // 分类
                            for(var j=0; j< phase.Nowadays.length; j++) {
                                const day = phase.Nowadays[j];
                                const sql = `select * from train_schedule_phase
                                where ParentId ='${day.Id}' 
                                and Type = 'Catogory' `
                                day.Catogory = await this.ctx.model.query(sql, {
                                    type: this.ctx.model.Sequelize.QueryTypes.SELECT
                                })
                            }
                        }
                    };
                }

            }
            return result;
        } catch (err) {
            throw err;
        }
    
    }

    /**
     *  get a train_schedule_user by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') {
            throw new Error('param error');
        }
        try {
            const result = await this.ctx.model.TrainScheduleUser.findOne({
                where: where
            });
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from train_schedule_user
     */
    async getLatest() {
        const result = await this.ctx.model.TrainScheduleUser.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a train_schedule_user
     * @param {Object} entity model train_schedule_user
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.TrainScheduleUser.update(entity.dataValues || entity, {
                where: {
                    Id: entity.Id
                }
            });
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * remove a record from train_schedule_user
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.trainScheduleUser.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from train_schedule_user
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.TrainScheduleUser.destroy({
                where: {
                    Id: entity.Id
                }
            });
            return result;
        } catch (err) {
            throw err;
        }
    }


    /**
     * search in TrainScheduleUser and left jion with {  }
     * @param {Object} pagination page 
     * @param {Object} where where
     * @param {Object} order order by  
     * @returns {Object} list 
     */
    async search(pagination, where, order) {
        let page = pagination ? pagination.current : 1;
        let pageSize = pagination ? pagination.pageSize : 10;

        // default query
        let whereCon = {
            Valid: {
                '$gt': 0
            }
        }
        if(where && typeof where === "object") {
            whereCon = Object.assign(whereCon, where)
        }

        //default order
        let orderCon = [['CreateTime','Desc']];
        if(order &&  order.length) {
            orderCon = order.concat(orderCon);
        }

        const querySql = (isCount) => {
            let selectVal =  "count(*) as count";
            let sql = "";
            if(isCount) {
                sql = sqlHelper.buildWhereCondition(whereCon, 'train_schedule_user');
            } else {
                selectVal = "train_schedule_user.*";
                sql = sqlHelper.buildCondition(pagination, whereCon, orderCon, 'train_schedule_user');
            }

            sql = `select ${selectVal}
                from train_schedule_user
                
                ${sql}
            `;

            return sql;
        }

        const countResult = await this.ctx.model.query(querySql(true), {
            type: this.ctx.model.Sequelize.QueryTypes.SELECT
        });

        const rowsResult = await this.ctx.model.query(querySql(), {
            type: this.ctx.model.Sequelize.QueryTypes.SELECT
        });

        return {
            page,
            pageSize,
            count: countResult.length ? countResult[0]["count"] : 0,
            rows: rowsResult
        }
    }
}

module.exports = TrainScheduleUserService;
