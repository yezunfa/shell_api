module.exports = () => {
    return async function (ctx, next) {
        var bodyParser = require('body-parser');
        ctx.app.use(bodyParser.json({limit: '50mb'}));
        ctx.app.use(bodyParser.urlencoded({
            limit: '50mb',
            extended:true
        }));
        await next();
    }
};
