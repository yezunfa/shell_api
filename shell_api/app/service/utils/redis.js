'use srtict';
const Service = require('egg').Service;
const redis = require("redis");
const moment = require('moment');

let client = null;

class Redis extends Service {

    /**获取redis 实例
     * 
     */
    async getInstance() {
        if (client) {
            return client;
        }
        let {
            ctx,
            app
        } = this;

        let {
            redisConfig
        } = app.config;

        try {
            client = redis.createClient(redisConfig.port, redisConfig.host);
            client.auth(redisConfig.pwd, function () {
                ctx.logger.info('通过认证Redis');
                console.log('通过认证');
            });
            client.info(function (err, response) {
                // console.log(err, response);
                if (err) {
                    ctx.logger.error('启动Redis异常', err, response)
                    console.log(err, response);
                } else {
                    ctx.logger.info('正常启动Redis')
                }

            });

            return client;
        } catch (ex) {
            ctx.logger.info('启动Redis异常', ex)
            return null;
        }

    }

    /**
     * 设置一个key value到redis
     * @param {String} key 
     * @param {String|Object} value
     * @param {Object} options 超时时间(单位秒)
     */
    async set(key, value, options) {

        let {
            ctx
        } = this;

        const {
            expire
        } = (options || {});
        try {
            if (!client) {
                client = await this.ctx.service.utils.redis.getInstance();
            }
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            return new Promise((resolve, reject) => {
                client.set(key, value, function (error, reposnse) {
                    // console.log(error, reposnse);
                    if (error) {
                        reject(error);
                    } else {
                        let res = reposnse;

                        if (expire) {
                            if (typeof expire === 'number') {
                                client.expire(key, expire, function (er, re) {
                                    console.log(er, re);
                                    if (er) {
                                        reject(er);
                                    } else {
                                        resolve(res);
                                    }
                                });
                            } else {
                                reject(new Error('expire must be number'));
                            }
                        } else {
                            resolve(res);
                        }

                    }

                });
            });

            // return result;
        } catch (ex) {
            ctx.logger.error('调用set Redis异常', ex);
            throw ex;
        }
    }


    /**
     * 根据key 获取一个对象
     * @param {String} key 
     * @param {Object} options
     * @param {Object} config.format json | string
     */
    async get(key, options) {
        let {
            ctx
        } = this;
        try {
            if (!client) {
                client = await this.ctx.service.utils.redis.getInstance();
            }
            if (!client) {
                return null;
            }
            return new Promise((resolve, reject) => {
                client.get(key, function (error, reposnse) {
                    // console.log(key, error, reposnse);
                    if (error) {
                        reject(error);
                    } else {
                        if (options && config.format && config.format === 'json') {
                            try {
                                if (typeof reposnse === 'string') {
                                    resolve(JSON.parse(reposnse));
                                } else {
                                    // should be null?
                                    resolve(reposnse);
                                }

                            } catch (ex) {
                                ctx.logger.error('string不能转换为json格式', reposnse, ex);
                                reject(ex);
                            }
                        } else {
                            resolve(reposnse);
                        }

                    }

                });
            });
            // return result;
        } catch (ex) {
            ctx.logger.error('调用get Redis异常', ex);
            throw ex;
        }
    }

    /**
     * 删除一个key对象
     */
    async del(key) {
        let {
            ctx
        } = this;
        try {
            if (!client) {
                client = await this.ctx.service.utils.redis.getInstance();
            }
            return new Promise((resolve, reject) => {
                client.del(key, function (error, reposnse) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(reposnse);
                    }

                });
            });
            // return result;
        } catch (ex) {
            ctx.logger.error('调用del Redis异常', ex);
            throw ex;
        }
    }

    /**
     * 是否存在某个key
     */
    async exists(key) {
        let {
            ctx
        } = this;
        try {
            if (!client) {
                client = await this.ctx.service.utils.redis.getInstance();
            }
            return new Promise((resolve, reject) => {
                client.exists(key, function (error, reposnse) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(reposnse);
                    }

                });
            });
            // return result;
        } catch (ex) {
            ctx.logger.error('调用exists Redis异常', ex);
            throw ex;
        }
    }

    /**
     * 代理服务方法
     * 功能：应用缓存，开关
     * @param {Object} options
     * @param {Object} config.serviceName 服务名
     * @param {Object} config.refresh 是否刷新缓存
     * @param {Object} service_args 对应serviceName方法的其他参数
     */
    async proxy(options, ...args) {
        const {
            ctx,
            app
        } = this;
        const {
            logger
        } = ctx;

        // 命名规范和controller调用的方法一致！并且在config/redis.config.js 里配好过期时间
        const redisCacheKey = config.serviceName;
        const redisCacheExpire = app.config.redisConfig.expire[redisCacheKey];
        if (!redisCacheExpire) {
            throw new Error("请先在redis.config中配置相关参数！");
        }

        // 为了刷新redis 先清除
        if (options && config.refresh || app.config.redisConfig.refresh || app.config.redisConfig.disable) {
            try {
                await ctx.service.redis.del(redisCacheKey);
            } catch (ex) {
                logger.error(`删除redis:${redisCacheKey}异常`, ex);
            }
        }

        if (!app.config.redisConfig.disable) {
            // 试从缓存服务器取，如果不存在，则从数据库取，同时保存到缓存服务器。
            try {
                let curTime = Date.now();
                const currentRateFromCache = await ctx.service.redis.get(redisCacheKey, {
                    format: 'json'
                });
                if (currentRateFromCache) {
                    logger.info(`命中获取redis:${redisCacheKey} time:${Date.now() - curTime}`);
                    return currentRateFromCache;
                }
            } catch (ex) {
                logger.error(`获取redis:${redisCacheKey}异常`, ex);
            }
        }

        try {
            // "service.cnhBanners.getHomepageBanners"
            let methodNames = config.serviceName.split('.');
            if (methodNames.length !== 3) {
                throw new Error("serviceName in good int good fortmat!");
            }
            let method = ctx[methodNames[0]][methodNames[1]][methodNames[2]]
            if (!method) {
                throw new Error(`no such method named ${config.serviceName}  in service`)
            }
            let result = await method.apply(this, args);
            if (!app.config.redisConfig.disable) {
                try {
                    // 失效时间，不需要用await 同步
                    ctx.service.redis.set(redisCacheKey, result, {
                        expire: redisCacheExpire
                    });
                } catch (ex) {
                    logger.error(`设置redis:${redisCacheKey}异常`, ex);
                }
            }
            return result;
        } catch (ex) {
            throw ex;
        }

    }

    /**
     * 设置一个hash_key value到redis
     * @param {String} key 
     * @param {String} field 一对键值对
     * @param {String} value 一对键值对
     * @param {Object} options 超时时间(单位秒)
     */
    async hset(key, field, value, options) {

        let {
            ctx
        } = this;

        const {
            expire
        } = (options || {});
        try {
            if (!client) {
                client = await this.ctx.service.utils.redis.getInstance();
            }
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            return new Promise((resolve, reject) => {
                client.hset(key, field, value, function (error, reposnse) {
                    // console.log(error, reposnse);
                    if (error) {
                        reject(error);
                    } else {
                        let res = reposnse;
                        if (expire) {
                            if (typeof expire === 'number') {
                                client.expire(key, expire, function (err, ress) {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(ress);
                                    }
                                });
                            } else {
                                reject(new Error('expire must be number'));
                            }
                        } else {
                            resolve(res);
                        }
                    }

                });
            });
            // return result;
        } catch (ex) {
            ctx.logger.error('调用hset Redis异常', ex);
            throw ex;
        }
    }

    /**
     * 根据key 获取一个hash对象的field值
     * @param {String} key 
     * @param {String} field
     * @param {Object} options
     * @param {Object} config.format json | string
     */
    async hget(key, field, options) {
        let {
            ctx
        } = this;
        try {
            if (!client) {
                client = await this.ctx.service.utils.redis.getInstance();
            }
            return new Promise((resolve, reject) => {
                client.hget(key, field, function (error, reposnse) {
                    console.log(key, field, error, reposnse);
                    if (error) {
                        reject(error);
                    } else {
                        if (options && config.format && config.format === 'json') {
                            try {
                                if (typeof reposnse === 'string') {
                                    resolve(JSON.parse(reposnse));
                                } else {
                                    // should be null?
                                    resolve(reposnse);
                                }

                            } catch (ex) {
                                ctx.logger.error('string不能转换为json格式', reposnse, ex);
                                reject(ex);
                            }
                        } else {
                            resolve(reposnse);
                        }
                    }
                });
            });
            // return result;
        } catch (ex) {
            ctx.logger.error('调用hget Redis异常', ex);
            throw ex;
        }
    }

    /**
     * 设置过期
     * @param {String} key 
     * @param {Number} expire  // 秒
     */
    async expire(key, expire) {
        if (!client) {
            client = await this.ctx.service.utils.redis.getInstance();
        }
        const isExist = await this.ctx.service.utils.redis.exists(key)
        return new Promise((resolve, reject) => {
            if(!isExist) {
                resolve(`${key} is not isExist`);
            }
            return client.expire(key, expire, function (er, res) {
                console.log(er, res);
                if (er) {
                    reject(er);
                } else {
                    resolve(res);
                }
            });
        });
          
    }

    /**
     * 获取业务流水号
     * 根据两位业务码字符串,生成一个流水号,格式按照:<br/>
     * yyyyMMdd{bizCode}{10位的自增序列号}
     */
    async getSequenceNo(options) {
        /** 检查业务码 todo */
        //  const isLegal =  checkIsisLegal(config.bizCode)
        //  if (!isLegal) {
        //      throw new ServiceException("bizCode参数不合法");
        //  }

        let config = Object.assign({
            dateFormat: 'YYYYMMDD',
            bizCode: '001',
            len: 20 // 必须大于dateFormat.len + bizCode.len
        }, options)
 
        try {
            if (config.dateFormat.length + config.bizCode.length >= config.len) {
                throw new Error('参数长度不对')
            }

            if (!client) {
                client = await this.ctx.service.utils.redis.getInstance();
            }

            /** 构造redis的key */
            const SERIAL_NUMBER = "serial.number:";
            /** 获取今天的日期:yyyyMMdd */
            const date = moment().format(config.dateFormat);
            const key = config.bizCode + SERIAL_NUMBER + date;

            /** 自增 */
            await client.incr(key);
            const sequence =  await this.ctx.service.utils.redis.get(key)
            
            // 
            const expireTime = parseInt((moment().endOf('day') - moment())/1000); // 秒
            console.log(expireTime, 'expireTimeexpireTimeexpireTimeexpireTime')
            if (expireTime > 0) {
                await this.ctx.service.utils.redis.expire(key, expireTime)
            }

            const sequenceLen = config.len - config.bizCode.length - config.dateFormat.length;
           
            const formatSequence = (number, len) => {
                let str = number + '';
                const prefixLen = len - str.length;
                let prefix = '';
                if (prefixLen > 0) {
                    for (var i = 0; i < prefixLen; i++) {
                        prefix += '0'
                    }
                };
                return `${prefix}${str}`;
            }

            return `${date}${config.bizCode}${formatSequence(sequence, sequenceLen)}`;
        } catch (ex) {
            this.ctx.logger.error('生成序列号异常:', ex)
            throw new Error('生成序列号异常')
        }

    }
}
module.exports = Redis;
