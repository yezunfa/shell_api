'use strict';

/**
 * MemberCouponService
 * useage: ctx.service.member_coupon
 */
const { sqlHelper } = require('../utils/index');
const Service = require('egg').Service;

class MemberCouponService extends Service {

    /**
     * create a new member_coupon
     * @param {Object} entity model member_coupon
     * @return {Object} entity a model Entity
     */
    async create(entity) {
        try {
            const result = await this.ctx.model.MemberCoupon.create(entity);
            return result;
        } catch (err) {
            throw err;
        }
    }

    /**
     *  get a member_coupon by Id
     * @param {String} Id guid
     * @return {Object} entity a model Entity
     */
    async getById(Id) {
        try {
            const result = await this.ctx.model.MemberCoupon.findOne({
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
     *  get a member_coupon by condtion
     * @param {Object} where condition
     * @return {Object} entity a model Entity
     */
    async getByCondition(where) {
        if(!where || typeof where !== 'object') {
            throw new Error('param error');
        }
        try {
            const result = await this.ctx.model.MemberCoupon.findOne({
                where: where
            });
            return result.dataValues || result;
        } catch (err) {
            throw err;
        }
    }

    /**
     * getLatest record from member_coupon
     */
    async getLatest() {
        const result = await this.ctx.model.MemberCoupon.findOne({
            order: [["CreateTime", 'DESC']]
        });
        return result;
    }


    /**
     * edit a member_coupon
     * @param {Object} entity model member_coupon
     * @return {Object} entity a model Entity
     */
    async edit(entity) {
        try {
            const result = await this.ctx.model.MemberCoupon.update(entity.dataValues || entity, {
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
     * remove a record from member_coupon
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async remove(entity) {
        try{
            entity.Valid = 0;
            return await this.ctx.service.memberCoupon.edit(entity);
        } catch (err) {
            throw err;
        }
    }

    /**
     * delete a record from member_coupon
     * @param {Object} entity a model Entity
     * @return {Object} affact count
     */
    async delete(entity) {
        try {
            const result = await this.ctx.model.MemberCoupon.destroy({
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
     * search in MemberCoupon and left jion with {  }
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
                sql = sqlHelper.buildWhereCondition(whereCon, 'member_coupon');
            } else {
                selectVal = "member_coupon.*";
                sql = sqlHelper.buildCondition(pagination, whereCon, orderCon, 'member_coupon');
            }

            sql = `select ${selectVal}
                from member_coupon
                
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

    async setUserId({ UserId, CouponId }) {
        const sql = `update member_coupon 
        set member_coupon.UserId = "${UserId}"
        where member_coupon.Id = "${CouponId}"`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.UPDATE
            });
            return result
        } catch (error) {
            throw new Error(error)
        }
    }
    async setOrderId({ OrderId, CouponId }) {
        const sql = `update member_coupon 
        set member_coupon.OrderId = "${OrderId}",
        member_coupon.State = 2
        where member_coupon.Valid = 1
        and member_coupon.UserId is not null
        and member_coupon.OrderId is null
        and member_coupon.Id = "${CouponId}"`

        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.UPDATE
            });
            console.log(result)
            return result
        } catch (error) {
            throw new Error(error)
        }
    }
    async getDetailById(Id) {
        const sql = `select 
        coupon. *, member_coupon.Id as MemberCouponId
        from member_coupon
        left join coupon
        on coupon.Id = member_coupon.CouponId
        where member_coupon.Id = "${Id}"
        and member_coupon.State = 1
        and member_coupon.Valid = 1
        and member_coupon.OrderId is null
        and coupon.State = 1
        and coupon.Valid = 1
        and to_days(coupon.ExpiredDate) >= to_days(now())
        and to_days(coupon.ActiveDate) <= to_days(now())`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            });
            return result
        } catch (error) {
            throw new Error(error)
        }
    }

    /**
     * 获取可用优惠卷列表
     */
    async Distribution(CouponId, UserId) {
        const sql = `select member_coupon.* 
        from member_coupon
        left join coupon
        on coupon.Id = member_coupon.CouponId
        where member_coupon.Valid = 1
        and member_coupon.State = 1
        and (
            member_coupon.UserId is null
            or member_coupon.UserId = "${UserId}"
        )
        and member_coupon.OrderId is null
        and member_coupon.CouponId = "${CouponId}"
        and coupon.State = 1
        and coupon.Valid = 1
        and to_days(coupon.ExpiredDate) >= to_days(now())
        and to_days(coupon.ActiveDate) <= to_days(now())`
        try {
            const result = await this.ctx.model.query(sql, {
                type: this.ctx.model.Sequelize.QueryTypes.SELECT
            });
            return result
        } catch (error) {
            throw new Error(error)
        }
    }
}

module.exports = MemberCouponService;
