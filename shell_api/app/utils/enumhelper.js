'use strict';


let Module = {

    /**
     * 根据KeyValue获取名称
     * @param {String} v
     * @returns {Bool}
     */
    getName: function(objects, keyvalue, defaultname) {
        let result = defaultname ? defaultname : "";
        keyvalue = keyvalue.toString();
        if (keyvalue && objects && objects.length > 0) {
            objects.forEach(item => {
                if (item.Value.toString() === keyvalue) {
                    result = item.Name;
                    return;
                }
            });
        }
        return result;
    },

    /**
     * 获取sql语法
     * @param {Object} option
     * @returns {String}
     */
    getSQL: function (option) {
        let feild = option && option.isCount ? "count(*)" : "o.* ,pro.OnlineTime, pro.Name as ProductName";
        let limit = option && option.isCount ? "" : option.pageCon;
        let state = option && option.isAll ? '': 'and o.ProductState in(:ProductState)';
        return `select ${feild} from cnh_userorder as o 
        left join cnh_product as pro on o.ProductId = pro.Id
        where o.Valid=1
        and o.UserId =:UserId
        ${state}
        order by o.CreateTime Desc ${limit}`;
        //and o.ProductState in(:ProductState)
    },

    /**
     * 隐藏手机号
     * @param {number} number mobile
     */
    hideMobile: function (number) {
        let str = number+'';
        str = str.substring(0, 3)+'****'+str.substring(7);
        return str;
    }
}

module.exports = Module;