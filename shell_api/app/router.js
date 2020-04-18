'use strict';

// app/router.js
module.exports = app => {
    require('./router/user')(app);
    require('./router/api')(app);
    require('./router/geographic')(app);
    require('./router/home')(app);
    require('./router/spa')(app);
    require('./router/upload')(app);
    require('./router/wxpay')(app);
    require('./router/wechat')(app);
    require('./router/payment')(app);
    require('./router/course')(app);
    require('./router/coach')(app);
    require('./router/face')(app);
    require('./router/order')(app);
    require('./router/migrate')(app);
    require('./router/administrator')(app);
    require('./router/madingyu')(app);
    require('./router/code')(app);
    require('./router/shell')(app);
};
