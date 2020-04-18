/**
 * 定时任务
 * @param {APP} app
 * @ref https://eggjs.org/zh-cn/basics/schedule.html
 */
module.exports = app => {
  return {
    schedule: {
      interval: '10s',
      type: 'all',
      disable: false, // app.config.env === 'local', 本地开发环境不执行
    },
    async task() {
      // const result = await app.curl('https://registry.npm.taobao.org/egg/latest', {
      //   dataType: 'json',
      // });
      // app.logger.info('Egg latest version: %s', result.data.version);
    },
  };
};
