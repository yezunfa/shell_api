'use strict';
const path = require('path');
const fs = require('fs');
const redisConfig = require('./redis.config');
const company = require('./company.config');

module.exports = appInfo => {
    let companyConfig = company.getCompanyConfig();
  
    const config = exports = {};
    config.keys = 'shell-api';
    config.redisConfig = redisConfig();
    config.cors = {
        origin: '*',
        allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
    }
    
    config.security = {
        domainWhiteList: companyConfig.domainWhiteList
    };
    config.security = {
        ctoken: true,
        csrf: {
            enable: false,// 前期开发环境下关闭
            useSession: true, // 默认为 false，当设置为 true 时，将会把 csrf token 保存到 Session 中
            cookieName: 'csrfToken', // Cookie 中的字段名，默认为 csrfToken
            sessionName: 'csrfToken', // Session 中的字段名，默认为 csrfToken
            queryName: '_csrf', // 通过 query 传递 CSRF token 的默认字段为 _csrf
            bodyName: '_csrf', // 通过 body 传递 CSRF token 的默认字段为 _csrf
        }
    };
    // https://eggjs.org/api/Config.html#bodyParser
    config.bodyParser = {
        jsonLimit: '100mb',
        formLimit: '100mb'
    };

    config.view = {
        mapping: {
            '.xtpl': 'xtpl',
            '*.xtpl': 'xtpl',
            '.html': 'xtpl',
        },
    };

    // xtpl config
    config.xtpl = {

    };

    config.staticPrefix = "assets";
    config.staticVersion = "0.0.1"; //静态版本，线上缓存设置

    config.cdnHost = {
        online: `//${companyConfig.domain}/${config.staticPrefix}/${config.staticVersion}`,
        pre: `//${companyConfig.domain}/${config.staticPrefix}/${config.staticVersion}`,
        daily: `//127.0.0.1:7001/${config.staticPrefix}/${config.staticVersion}`
    }

    config.static = {
        prefix: `/${config.staticPrefix}/${config.staticVersion}/`,// http://xxxx/assets
        dir: path.join(appInfo.baseDir, 'app/'),
        preload: true,
        dynamic: true,
        buffer: false,
        maxAge: 0,
    };

 // mysql 插件
 config.mysql = {
    client: {
      host: '120.24.169.8',
      port: '3306',
      user: 'root',
      password: 'shellDental@666',
      database: 'shell',
      timezone: '+08:00'
    },
    app: true,
}

  config.sequelize = {
    host: '120.24.169.8',
    port: '3306',
    user: 'root',
    password: 'shellDental@666',
    database: 'shell',
    timezone: '+08:00'
  }

    config.middleware = ['errorHandler', 'xtplExtend', 'codeUserService', 'toolUtils'];//'xmlparse'

    config.robot = {
        ua: [
            /curl/i,
            /Baiduspider/i,
        ],
    };
    config.userService = {
        ignore: /[^\s]*/,
    }
    // config.userService = {
    //     ignore: /(^\/$)|^\/(user\/login|user\/login2|api\/login\/account|user\/logout|setting.*|spa.*|error|token.*|api.*|home.*|course.*|coach.*|store.*|card.*|user.*)$/,
    // }
    
    config.codeUserService = {
        matchRoute: '/code',
        ignore: /^\/(code\/login)$/,
    }

    config.imgServer = {
        savePath: '/mnt/data1/assets/',
        host: '//127.0.0.1:9001/'
    }
    return config;
}