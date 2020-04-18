'use strict';

/**
 * TrainSchedulePhaseActionService
 * useage: ctx.service.train_schedule_phase_action
 */
const { sqlHelper } = require('../utils/index');
const Service = require('egg').Service;

class TrainSchedulePhaseActionService extends Service {

    /**
     * create a new train_schedule_phase_action
     * @param {Object} entity model train_schedule_phase_action
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.TrainSchedulePhaseAction.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a train_schedule_phase_action by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById(Id) {
        try {
            const result = await this.ctx.model.TrainSchedulePhaseAction.findOne({
                where: {
                    Id
                }
            });
            return result ? result.dataValues : null
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a train_schedule_phase_action by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') {
            throw new Error('param error');
        }
        try {
            const result = await this.ctx.model.TrainSchedulePhaseAction.findOne({
                where: where
            });
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from train_schedule_phase_action
     */
    async getLatest() {
        const result = await this.ctx.model.TrainSchedulePhaseAction.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a train_schedule_phase_action
     * @param {Object} entity model train_schedule_phase_action
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.TrainSchedulePhaseAction.update(entity.dataValues || entity, {
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
     * remove a record from train_schedule_phase_action
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.trainSchedulePhaseAction.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from train_schedule_phase_action
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.TrainSchedulePhaseAction.destroy({
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
     * search in TrainSchedulePhaseAction and left jion with {  }
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
                sql = sqlHelper.buildWhereCondition(whereCon, 'train_schedule_phase_action');
            } else {
                selectVal = "train_schedule_phase_action.*";
                sql = sqlHelper.buildCondition(pagination, whereCon, orderCon, 'train_schedule_phase_action');
            }

            sql = `select ${selectVal}
                from train_schedule_phase_action
                
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

module.exports = TrainSchedulePhaseActionService;
