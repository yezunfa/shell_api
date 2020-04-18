'use strict';

const path = require('path');

exports.static = true;

exports.ua = {
  enable: true,
  path: path.join(__dirname, '../lib/plugin/my-egg-ua'),
};

exports.xtpl = {
  enable: true,
  package: 'egg-view-xtpl',
};

exports.sequelize = {
  enable: true,
  package: 'egg-sequelize',
};

exports.cors = {
  enable: true,
  package: 'egg-cors',
}

exports.jsonp = {
  enable: true,
  package: 'egg-jsonp',
};

exports.mysql = {
  enable: true,
  package: 'egg-mysql',
};