'use strict';

/**
 * FaceDeviceService
 * useage: ctx.service.face_device
 */
const { sqlHelper } = require('../utils/index');
const Service = require('egg').Service;

class FaceDeviceService extends Service {

    /**
     * create a new face_device
     * @param {Object} entity model face_device
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.FaceDevice.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a face_device by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById(Id) {
        try {
            const result = await this.ctx.model.FaceDevice.findOne({
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
     *  get a face_device by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') {
            throw new Error('param error');
        }
        try {
            const result = await this.ctx.model.FaceDevice.findOne({
                where: where
            });
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from face_device
     */
    async getLatest() {
        const result = await this.ctx.model.FaceDevice.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a face_device
     * @param {Object} entity model face_device
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.FaceDevice.update(entity.dataValues || entity, {
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
     * remove a record from face_device
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.faceDevice.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from face_device
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.FaceDevice.destroy({
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
     * search in FaceDevice and left jion with {  }
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
                sql = sqlHelper.buildWhereCondition(whereCon, 'face_device');
            } else {
                selectVal = "face_device.*";
                sql = sqlHelper.buildCondition(pagination, whereCon, orderCon, 'face_device');
            }

            sql = `select ${selectVal}
                from face_device
                
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

module.exports = FaceDeviceService;
