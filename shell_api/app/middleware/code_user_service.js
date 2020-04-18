'use strict';

module.exports = (option, app) => {
  return async function(ctx, next) {
    try {
      if(ctx.request.url.indexOf('/code') === 0 || ctx.request.url === '/') {
        if(!ctx.request.url.match(option.ignore) && ctx.session.codeUser && ctx.session.codeUser.loginName) {
          ctx.locals.$user = ctx.session.codeUser;
        } else {
          // 重定向写法,不是首页就去首页,是首页就不管，不然会死循环
          if(!ctx.request.url.indexOf('/code/home') === 0 &&  !ctx.request.url === '/') {
            ctx.redirect('/code/home');
          }
        }
      }
      await next();
    } catch (err) {
      // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
      app.emit('error', err, this);

      const status = err.status || 500;
      // 生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含敏感信息
      const error = status === 500 && app.config.env === 'prod'
        ? 'Internal Server Error'
        : err.message;
      // 从 error 对象上读出各个属性，设置到响应中
      ctx.body = { error };
      if (status === 422) {
        ctx.body.detail = err.errors;
      }
      ctx.status = status;
    }
  };
};
