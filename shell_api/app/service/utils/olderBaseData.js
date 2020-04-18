const Sequelize = require('sequelize')
const OlderBase = new Sequelize('relian', 'relian', 'Fusion2017', {
    host: 'rm-wz9vdv9j1jy7re5o1o.mysql.rds.aliyuncs.com',
    database: 'relian',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    logging: false
})
exports.relian = OlderBase;