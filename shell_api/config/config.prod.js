'use strict';
// const path = require('path');
const redisConfig = require('./redis.config.prod');
const company = require('./company.config');

 
module.exports = appInfo => {
    const config = exports = {};
    config.redisConfig = redisConfig();
    config.isProd = true;

    let companyConfig = company.getCompanyConfig();

    config.imgServer = {
        savePath: companyConfig.imgServer.savePath ||  '/mnt/data1/assets/', // 图片上传保存路径
        host: companyConfig.imgServer.host ||   '//assets.51fusion.com/'
    }

    // log save to 
    config.logger = {
        dir: '/mnt/data2/logs/fusion-api'
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

    
    return config;
}
