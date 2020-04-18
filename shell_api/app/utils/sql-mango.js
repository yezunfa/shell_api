'use strict';

const sqlHelper = require('../utils/sql-helper');

/**
 * Sql 注入检查方法
 * @param {String} s 
 */
const isSqlInjectStr = s => {
    if(typeof s === 'string') {
        let sqlInjectReg = /select(\s+|%20)|union(\s+|%20)|insert(\s+|%20)|delete(\s+|%20)|from(\s+|%20)|count(\s+|%20)|drop(\s+|%20)|tableupdate(\s+|%20)|truncate(\s+|%20)|asc(\s+|%20)|mid(\s+|%20)|char(\s+|%20)|xp_cmdshellexec(\s+|%20)|masternet(\s+|%20)|localgroup(\s+|%20)|administrators(\s+|%20)|net(\s+|%20)|user(\s+|%20)|or(\s+|%20)/;
        return sqlInjectReg.test(s.toLocaleLowerCase());
    }
    return false;
};

const handleClause = ({$key, value, connect}) => {
    switch ($key) {
        case '$eq': // 相等
            return ` = ${value}`
        case '$like': // 相似
            return ` like "%${value}%"`
        case '$gt': // 大于
            return ` > ${value}`
        case '$lt': // 小于
            return ` < ${value}`
        case '$gte': // 大于等于
            return ` >= ${value}`
        case '$lte': // 小于等于
            return ` <= ${value}`
        case '$ne': // 不等于
            return ` <> ${value}`
        case '$between': // 在之间
            if (!(value instanceof Array)) console.log("between 需要传入数组")
            if (value.length < 2) console.error("数组长度必须等于2")
            return ` between "${value[0]}" ${connect} "${value[1]}"`
        case '$in': //
            if (!(value instanceof Array)) console.log("$in 需要传入数组")
            if (value.length < 2) console.info("建议使用eq或者like")
            return ` in("${value.join(`", "`)}")`
        case '$null':
            if (value) return ` is null`
            return ` is not null`
        default:
            return ` like "%${value}%"`
    }
}

const sequlizeCondition = (keyname, object, connect = "") => {
    let condition = ``
    for (const key in object) {
        if (!object.hasOwnProperty(key)) continue
        let value = object[key];
        if (!value && value !== 0) {
            console.log(`value值不存在:${value}!!!!!!!!!!`)
            continue;
        }
        const $key = key.split("_")[0]
        const $type = key.split("_")[1]
        
        switch ($type) {
            case "toDays":
                value = `to_days("${value}")`
                if (value instanceof Array) value = value.map(item => `to_days("${item}")`)

                condition += ` ${connect} to_days(${keyname})`
                condition += handleClause({$key, value, connect})
                break;
            case "contains":
                if (!(value instanceof Array)) console.error("contains 必须是数组")
                const contains = value.map(item => {
                    const result = handleClause({$key: "$like", value: item})
                    return  `${keyname} ${result}`
                })
                condition += ` ${connect}  (${contains.join(` or `)})`
                break;
            default:
                condition += ` ${connect}  ${keyname}`
                condition += handleClause({$key, value})
                break;
        }
    }
    return condition
}

exports.supplementary = sequlizeCondition

/**
 * query条件转sql语句 
 * 示例(详情请见sequlizeCondition方法)
 * @param {Object} query
 * query = { Valid : { $gt: 0 } }  => and tablename.Valid > 0
 * query = { Valid : { $gt: 0 }, Name: "示例" }  => and tablename.Valid > 0 and tablename.Name like %示例%
 * query = { Name : "示例", or_NickName: "示例" }  => and tablename.Name like %示例% or tablename.Name like %示例%
 * @param {String} tableName
 * @return {String} sql where 1 = 1 and ....
 */
exports.buildWhereCondition = (query, tableName, deleteWhere) => {
    let sql_query = '';
    if (!deleteWhere) sql_query += 'where 1 = 1'
    if (!query) return sql_query
    
    for (const $key in query) { 
        const arrayKey = $key.split("_")
        const key = arrayKey[arrayKey.length - 1]
        const connect = arrayKey.length === 2 ? arrayKey[0] : "and" // $key = or_Name // and || or

        if (!query.hasOwnProperty($key) || !query[$key]) continue
        const element = query[$key];
        const keyname = tableName ? `${tableName}.${key}` : `${key}`;

        // 如果key是$开头则寻找相应方法
        const switchkey = key.indexOf("$") === 0 ? key : typeof element // 
        switch (switchkey) {
            case 'object':
                sql_query += sequlizeCondition(keyname, element, connect)
                break;
            case 'string':
                sql_query += ` ${connect} ${keyname} like "%${element}%"`
                break;
            case '$multiple':
                const $multiple = []
                if (!(typeof element === "object")) console.error("应当传入对象")
                for (const field in element) {
                    const value = element[field]
                    $multiple.push(sequlizeCondition(`${tableName}.${field}`, value))
                }
                sql_query += ` and (${$multiple.join(` or`)})`
                break;
            default:
                sql_query += ` ${connect} ${keyname} = ${element}`
                break;
        }
        if(isSqlInjectStr(element)) throw new Error('禁止使用Sql注入的注入方式:' + element);
    }
    return sql_query
}


/**
 * join: {course_type: { on: ['', ''],query: { ParentId: $null: 1 } }}
 */
exports.buildLeftjoin = (join, tablename) => {
    let join_left = ''
    let join_query = ''
    for (const table in join) {
        if (join.hasOwnProperty(table)) {
            const { on, query } = join[table]
            if (on instanceof Array) {
                join_left = `${join_left}left join ${table} on ${table}.${on[0]} = ${tablename}.${on[1]}
            `
            }
            join_query = `${join_query}${exports.buildWhereCondition(query, table, true)}
            `
        }
    }
    return {
        left: join_left,
        query: join_query
    }
}

exports.buildCondition = (page, where, order, tableName) => {
    return {
        condition: exports.buildWhereCondition(where, tableName),
        order: buildOrderConditon(order, tableName),
        limit: sqlHelper.buildPageCondition(page)
    }
}

const buildOrderConditon = (order, tableName) => {
    let orderCon = [];
    if (order && order.length) {
        order.forEach(order => {
            if (order.length && order.length > 1) {
                orderCon.push(`${tableName}.${order[0]} ${order[1]}`);
            }
        });
    }
    if (orderCon.length) {
        return "order by " + orderCon.join(',')
    }
};