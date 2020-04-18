'use strict';

var _ = require('lodash');
var Faker = require('faker');

//常用标题
var title = [
    "BTC 合约",
    "HAC 合约",
    "【满99减40】BTC 合约",
    "【买一送3】BTC HAC"
];

var name = [
    "Name 1",
    "Name 名称2",
    "name 3",
    "Name 4"
];

var todos = [
    "吃饭",
    "睡觉",
    "打豆豆",
    "撸代码"
];

var MockFaker = function () {

}


//字段规则,用定定义字段mock规范
MockFaker.prototype.Field = {
    name: function (params) {
        return name[_.random(0, name.length - 1)];
    },
    title: (params) => {
        var times = _.random(1, 10);
        var result = [];
        for (var i = 0; i < times; i++) {
            result.push(todos[_.random(0, todos.length - 1)]);
        }
        return result.join('然后');
    },
    itemTitle: function () {
        return title[_.random(0, title.length - 1)];
    },
    activityName: function (params) {
        var aName = [
            "双十一活动",
            "年货节活动",
            "双12活动",
            "618活动"
        ]
        return aName[_.random(0, aName.length - 1)];
    },
    activityDesc: function (params) {
        var aName = [
            "双11",
            "年货节",
            "双12",
            "618"
        ]
        return aName[_.random(0, aName.length - 1)];
    },
    discount: function () {
        return parseFloat(Math.random().toFixed(2));
    },
    sku: function () {
        var aName = [
            ["红色", "43"],
            ["绿色", "38"],
            ["白色", "99"]
        ]
        return aName[_.random(0, aName.length - 1)];
    },
    guid: function () {
        return tool.guid();
    },
    time: function (paramTime, formatStr) {
        var pTime = new Date();
        if (paramTime) {
            var pTime = new Date(Date.parse(paramTime.replace(/-/g, "/"))); //将参数转换成时间类型
        }
        var format = formatStr || "yyyy-MM-dd hh:mm:ss";
        return pTime.format(format);
    },
    timeNow: function () {
        return Date.now();
    },
    words: function (count) {
        return Faker.lorem.words();
    },
    url: function (parm) {
        var url = ["//test.cnhash.com", "//test.cnhash.com/you", "//127.0.0.1/index"];
        return url[_.random(0, url.length - 1)];
    },
    price: function () {
        return Faker.commerce.price();
    },
    email: function name(params) {
        return Faker.internet.email();
    },
    number: function (num) {
        return Faker.random.number(num);
    },
    range: function (start, end) {
        return _.random(start, end);
    },
    mobile: function name(params) {
        var list = [
            "15000875257",
            "13401996367",
            "15801113301"
        ]
        return list[_.random(0, list.length - 1)];
    },
    area: function name(params) {
        var list = [
            "上海",
            "北京",
            "浙江",
            "广东"
        ]
        return list[_.random(0, list.length - 1)];
    },
    image: function (size) {
        var cutSize = size || 600;
        // Credit http://www.paulirish.com/2009/random-hex-color-code-snippets/
        return 'http://placehold.it/' + cutSize + '/' + Math.floor(Math.random() * 16777215).toString(16);

        //http://dummyimage.com/710x79 dip 的使用方法
    },
    boolean: function (num) {
        if (_.random(true, false)) {
            return true;
        }
        return false;
    },
    enum: function (data) {
        var mapData = [];
        if (typeof data === "array") {
            var mapData = data;
            return mapData[_.random(mapData.length - 1)];
        } else if (typeof data === "object") {
            //将返回的数据列表保存到mapData
            var matchData = data;
            for (var d in matchData) {
                if (matchData.hasOwnProperty(d)) {
                    mapData.push(matchData[d]);
                }
            }

            //随机返回一个数据
            return mapData[_.random(mapData.length - 1)];
        }
    },
    oneOf: function (data) {
        var mapData = [];
        if (typeof data === "array") {
            var mapData = data;
            return mapData[_.random(mapData.length - 1)];
        } else if (typeof data === "object") {
            //将返回的数据列表保存到mapData
            var matchData = data;
            for (var d in matchData) {
                if (matchData.hasOwnProperty(d)) {
                    mapData.push(matchData[d]);
                }
            }

            //随机返回一个数据
            return mapData[_.random(mapData.length - 1)];
        }
    },
    text: function () {
        return encodeURIComponent(`
            <h2>这个一段很长的文字</h2>
            <p>生存还是毁灭，这是一个值得思考的问题。默默忍受命运暴虐的毒箭，或是挺身反抗人世无涯的苦难，通过斗争把它们扫清，这两种行为哪种更高贵？死了，睡着了，什么都完了……</p>
            <div class="image-view" data-width="658" data-height="907"><img data-original-src="//upload-images.jianshu.io/upload_images/2259045-c55bb2fca8928ac1" data-original-width="658" data-original-height="907" data-original-format="image/jpeg" data-original-filesize="52364" class="" style="cursor: zoom-in;" src="//upload-images.jianshu.io/upload_images/2259045-c55bb2fca8928ac1?imageMogr2/auto-orient/strip%7CimageView2/2/w/658"></div>
        `);
    }

}

module.exports = new MockFaker();
