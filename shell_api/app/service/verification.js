'use strict';

const { Service } = require('egg')

class Verification extends Service {
    async search ({Mobile, CheckCode}) {
        const { ctx } = this
        const sql = `select * 
        from verification_code
        where Valid = 1
        and Mobile = "${Mobile}"
        and Code = "${CheckCode}"
        and InvalidTime >= now()`
        try {
            const type = ctx.model.Sequelize.QueryTypes.SELECT
            const result = await this.ctx.model.query(sql, { type });
            return result
        } catch (error) {
            throw error
        }
    }

    async update (Fields, Condition) {
        const { ctx } = this
        try {
            const sets = []
            for (const key in Fields) {
                const value = Fields[key];
                sets.push(`verification_code.${key} = "${value}"`)
            }

            const wheres = []
            for (const key in Condition) {
                const value = Condition[key];
                wheres.push(`verification_code.${key} = "${value}"`)
            }

            const sql = `update verification_code
            set ${sets.join(`, `)}
            where ${wheres.join(` and `)}`

            const type = ctx.model.Sequelize.QueryTypes.UPDATE
            const result = await this.ctx.model.query(sql, { type });
            return result
        } catch (error) {
            throw error
        }
    }
}


module.exports = Verification;
