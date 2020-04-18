module.exports = () => {
    const redisConfig = {
        port: 6379,
        host: "localhost",
        pwd: "fusion@9102",
        refresh: false,
        disable: false,
        expire: {
            "controller.home.index": 60, // 首页整个页面
        }
    }
    return redisConfig;
}
