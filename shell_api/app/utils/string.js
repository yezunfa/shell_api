'use strict';
/**
 * @classdesc 此类包含一系列字符串函数转换器
 * @mixin utils/string
 * @author alexyu
 */
/** @lends utils/string */


let Module = {
    /**
     * 去除字符串首尾空格
     * @param {String} v
     * @returns {String}
     */
    trim: function (x) {
        if (typeof x !== "string") {
            return x;
        }
        return x.replace(/^\s+/, "").replace(/\s+$/, "");
    },

    /**
     * 字符串转换为数字
     * @param {String} v
     * @returns {Number}
     */
    toNumber: function (x) {
        return parseFloat(x);
    },
    /**
     * 进行字符串查找，相当于脚本字符串方法indexOf
     * @param {String} v
     * @param {String} sub
     * @returns {Number}
     */
    indexOf: function (str, sub) {
        return str.indexOf(sub);
    },
    /**
     * 根据一个颜色字符串，返回对比色字符串
     * @param {String} color
     * @param {Object} [params] 参数
     * @param {String} [params.light='#FFFFFF'] 浅色
     * @param {String} [params.dark='#000000'] 深色
     * @param {String} [params.threshold=0.43] 临界值
     * @returns {String}
     */
    rgbContrast: function (runtime, _params) {
        let params = _params || {},
            light = params.light || "#FFFFFF",
            dark = params.dark || "#000000",
            threshold = params.threshold || 0.43;

        function sub(idx) {
            return runtime.length === 4 ? parseInt('' + runtime.charAt(idx + 1) + runtime.charAt(idx + 1), 16) : parseInt(runtime.substr(idx * 2 + 1, 2), 16);
        }

        return (0.2126 * (sub(0) / 255) + 0.7152 * (sub(1) / 255) + 0.0722 * (sub(2) / 255)) < threshold ? light : dark;
    },
    /**
     * 从左边对字符串使用指定的字符进行填充到指定长度
     * @param {String} v
     * @param {Object} params 参数
     * @param {String} params.num 填充长度
     * @param {String} [params.chr=' '] 填充字符，默认为空格
     * @returns {String}
     */
    lpad: function (str, param) {
        let num = param.num;
        if (typeof (str) !== "string") {
            str = str.toString();
        }
        while (str.length < num) {
            str = (param.chr || ' ') + str
        }
        return str;
    },

    /**
     * 进行字符串切割，相当于脚本字符串方法substring
     * @param {String} v
     * @param {Number} start 开始位置
     * @param {Number} end 结束位置
     * @returns {String}
     */
    substring: function (str, start, end) {
        if (typeof str !== "string") {
            return str;
        }
        return str.substring(start, end);
    },
    /**
     * 判断字符串是否一个Email地址
     * @param {String} v
     * @returns {Bool}
     */
    isEmail: function (v) {
        return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(v);
    },
    /**
     * 判断字符串是否一个Url地址
     * @param {String} v
     * @returns {Bool}
     */
    isUrl: function (v) {
        return /((http|ftp|https):)?\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/.test(v);
    },
    /**
     * 判断字符串是否一个电话号码
     * @param {String} v
     * @returns {Bool}
     */
    isTel: function (v) {
        return /^\d{3}-\d{8}$|^\d{4}-\d{7}$|^\d{11}$/.test(v);
    },
    /**
     * 判断字符串是否一个正整数
     * @param {String} v
     * @returns {Bool}
     */
    isPositiveInteger: function (v) {
        return /^\+?[1-9]\d*$/.test(v);
    },
    /**
     * 判断字符串是否一个整数
     * @param {String} v
     * @returns {Bool}
     */
    isInteger: function (v) {
        return /^[\+-]?[0-9]\d*$/.test(v);
    },
    /**
     * 判断字符串是否一个标准名称字符串（不能包含引号等特殊字符）
     * @param {String} v
     * @returns {Bool}
     */
    isItemName: function (v) {
        return /^[^\"\']{1,1024}$/.test(v);
    },
    /**
     * 判断字符串是否一个数字
     * @param {String} v
     * @returns {Bool}
     */
    isNumber: function (v) {
        return !isNaN(v * 1);
    },
    /**
     * 判断字符串是否一个颜色字符串
     * @param {String} v
     * @returns {Bool}
     */
    isRgb: function (v) {
        return /^#(?:[0-9a-f]{6}|[0-9a-f]{3})$/i.test(v);
    }
}

module.exports = Module;
