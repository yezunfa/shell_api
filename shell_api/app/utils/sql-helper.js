'use strict';

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

exports.isSqlInjectStr = isSqlInjectStr;

exports.buildWhereCondition = (where, tableName) => {
    let whereCon = ['where 1=1'];
    if (where) {
        // console.log(where, 'sql_help');
        for (var field in where) {
            let curField = where[field];
            // if(curField["$or"]) {
            //     fieldValue = ` or `;
            //     curField = curField["$or"];
            // } else if(curField["$and"]) {
            //     curField = curField["$and"];
            // }
            let fieldName = tableName ? `${tableName}.${field}` : `${field}`;
            let value = curField;
            let testInjectSqlValue = value;
            if (typeof value === 'object') {
                // 多条件, 在前端字段前加_$OR_Field: [1,2]
                if (fieldName.indexOf('_$OR_') > -1) {
                    if (value && value.length) {
                        fieldName = fieldName.replace('_$OR_', '');
                        let orCon = [];
                        testInjectSqlValue = '';
                        value.forEach(v => {
                            if (v === -1) {
                                orCon.push(` ${fieldName} is not null `)
                            } else {
                                const orValue = typeof v === 'string' ? `'${v}'` : v;
                                orCon.push(` ${fieldName}=${orValue}`)
                                testInjectSqlValue += orValue;
                            }

                        });
                        whereCon.push(` and ( ${orCon.join(' OR ')} )`)
                    }
                } else if (curField["$eq"]) {
                    value = typeof curField["$eq"] === 'string' ? `'${curField["$eq"]}'` : curField["$eq"];
                    whereCon.push(`and ${fieldName}=${value}`)
                } else if (curField["$like"]) {
                    value = curField["$like"];
                    whereCon.push(`and ${fieldName} like ${value}`)
                } else if (curField["$gt"]) {
                    value = typeof curField["$gt"] === 'string' ? `'${curField["$gt"]}'` : curField["$gt"];
                    whereCon.push(`and ${fieldName}>${value}`)
                } else if (curField["$lt"]) {
                    value = typeof curField["$lt"] === 'string' ? `'${curField["$lt"]}'` : curField["$lt"];
                    whereCon.push(`and ${fieldName}<${value}`)
                } else if (curField["$gte"]) {
                    value = typeof curField["$gte"] === 'string' ? `'${curField["$gte"]}'` : curField["$gte"];
                    whereCon.push(`and ${fieldName}>=${value}`)
                } else if (curField["$lte"]) {
                    value = typeof curField["$lte"] === 'string' ? `'${curField["$lte"]}'` : curField["$lte"];
                    whereCon.push(`and ${fieldName}<=${value}`)
                } else if (curField["$ne"]) { // 不等于
                    value = typeof curField["$ne"] === 'string' ? `'${curField["$ne"]}'` : curField["$ne"];
                    whereCon.push(`and ${fieldName}<>${value}`)
                } else if (curField["$between"]) { //在${[]}之间 
                    value = typeof curField["$between"] === 'string' ? `'${curField["$between"]}'` : curField["$between"];
                    whereCon.push(`and ${fieldName} between "${value[0]}" and "${value[1]}" `)
                } else if (curField["$Besides"]) { //除了${[]}以外
                    value = typeof curField["$Besides"] === 'string' ? `'${curField["$Besides"]}'` : curField["$Besides"];
                    let Besides = '';
                    for (let i = 0; i < value.length; i++) {
                        const element = value[i];
                        Besides = `${Besides} and ${fieldName} <> ${element}`
                    }
                    whereCon.push(`${Besides}`);
                } else if (value && value instanceof Array && value.length > 0) {
                    let arr = [];
                    value.forEach(element => {
                        arr.push(`"${element}"`);
                    });
                    whereCon.push(`and ${fieldName} in (${arr.toString()})`)
                }
            } else {
                if (typeof value === 'string') {
                    if (value) {
                        whereCon.push(`and ${fieldName} like '%${value}%'`)
                    }
                } else {
                    whereCon.push(`and ${fieldName}=${value}`)
                }
            }

            if(isSqlInjectStr(testInjectSqlValue)) {
                throw new Error('禁止使用Sql注入的注入方式:' + testInjectSqlValue);
            } else{
                console.log(testInjectSqlValue, 'dssdsdsdsddssd')
            }
        }
    }
    return whereCon.join(' ')
}

exports.buildPageCondition = (pagination) => {
    if (!pagination) return ''
    let page = pagination ? pagination.current : 1;
    let pageSize = pagination ? pagination.pageSize : 10;
    return ` limit ${(page-1) * pageSize}, ${pageSize}`;
};

exports.buildOrderConditon = (order) => {
    let orderCon = [];
    if (order && order.length) {
        order.forEach(order => {
            if (order.length && order.length > 1) {
                orderCon.push(`${order[0]} ${order[1]}`);
            }
        });
    }
    if (orderCon.length) {
        return " order by " + orderCon.join(',')
    }
};

exports.buildCondition = (page, where, order, tableName) => {
    return exports.buildWhereCondition(where, tableName) + exports.buildOrderConditon(order) + exports.buildPageCondition(page);
}


exports.buildChart = isCount => {
    const field = isCount ? 'count(*)' : 'IFNULL(sum(Price*Count),0)';
    const sql = `
          select ${field} as num from cnh_userorder as o
          where to_days(o.OrderTime) = to_days(now())
          union all
          select ${field} from cnh_userorder as o
          where DATE_FORMAT( o.OrderTime, '%Y%m' ) = DATE_FORMAT( CURDATE( ) , '%Y%m' ) 
          union all 
          select ${field} from cnh_userorder as o 
          where PERIOD_DIFF( date_format( now( ) , '%Y%m' ) , date_format( o.OrderTime, '%Y%m' ) ) =1
          union all
          select ${field} from cnh_userorder as o 
          where YEARWEEK(date_format(o.OrderTime,'%Y-%m-%d'),1) = YEARWEEK(now(),1) 
          union all
          select ${field} from cnh_userorder as o 
          where YEARWEEK(date_format(o.OrderTime,'%Y-%m-%d'),1) = YEARWEEK(now(),1)-1;
      `;
    return sql;
};
