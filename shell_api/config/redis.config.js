module.exports = () => {
    const redisConfig = {
        port: 6379,
        host: "118.190.62.2",
        pwd: "alex2019",
        refresh: false,
        disable: false,
        expire: {
            "controller.home.index": 60, // 首页整个页面
        }
    }
    return redisConfig;
}
