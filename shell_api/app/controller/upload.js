'use strict';

const fs = require('fs');
const path = require('path');
const Controller = require('egg').Controller;
const awaitWriteStream = require('await-stream-ready').write;
// const sendToWormhole = require('stream-wormhole');
const uuid = require('uuid');
const ueditorConfig = require('../public/third-part/ueditor/nodejs/config');

class upload extends Controller {
    async show() {
        await this.ctx.render('page/form.html');
    }
 
    /* 上传首页 */
    async index() {
        await this.ctx.render('upload/index.xtpl');
    }

    async upload() {
        const stream = await this.ctx.getFileStream();
        // const filename = encodeURIComponent(stream.fields.name) + path.extname(stream.filename).toLowerCase();;
        const filename = uuid.v4() + path.extname(stream.filename).toLowerCase();
        const target = path.join(this.config.imgServer.savePath, filename);
        const writeStream = fs.createWriteStream(target);
        try {
            await awaitWriteStream(stream.pipe(writeStream));
        } catch (err) {
            // await sendToWormhole(stream);
            throw err;
        }
        this.ctx.body = {
            code: "0",
            imgURL: this.config.imgServer.host + filename
        }
        // redirect('/public/' + filename);
    }

    async ueditor() {

        let ActionType = {
            uploadimage: {
                name: 'uploadimage',
                savePath: this.config.imgServer.savePath
            },
            uploadfile: {
                name: 'uploadfile',
                savePath: this.config.imgServer.savePath
            },
            uploadvideo: {
                name: 'uploadvideo',
                savePath: this.config.imgServer.savePath
            },
            listimage: {
                name: 'listimage',
                savePath: this.config.imgServer.savePath
            },
            config: {
                name: 'config'
            }
        }

        // 保存文件
        let saveFile = async (ctx, savePath) => {
            const stream = await ctx.getFileStream();
            const filename = uuid.v4() + path.extname(stream.filename).toLowerCase();
            const target = path.join(savePath, filename);
            const writeStream = fs.createWriteStream(target);

            try {
                await awaitWriteStream(stream.pipe(writeStream));
                return {
                    'url': this.config.imgServer.host + filename,
                    'title': ctx.request.body.pictitle,
                    'original': filename,
                    'state': 'SUCCESS'
                }
            } catch (err) {
                // await sendToWormhole(stream);
                return {
                    'message': "Save Exception" + err.message,
                    'state': 'Fail'
                }
            }
        }

        // 获取文件列表
        let getImgList = async (savePath) => {
            var fileList = [];
            fs.readdir(savePath, function (err, files) {

                for (var i = 0; i < files.length; i++) {
                    var filename = files[i];
                    var stats = fs.statSync(savePath + filename);
                    if (stats.isDirectory()) {
                        fileList.push({
                            filename: filename,
                            url: savePath + filename
                        });
                    }
                }
                // console.log(fileList);
            });
        }

        let result = null;
        let actionType = this.ctx.request.query.action;
        let savePath = ActionType[actionType] ? ActionType[actionType].savePath : null
        switch (actionType) {
            case ActionType.uploadimage.name:
            case ActionType.uploadfile.name:
            case ActionType.uploadvideo.name:
                result = await saveFile(this.ctx, savePath);
                break;
            case ActionType.listimage.name:
                result = await getImgList(savePath)
                break;
            case ActionType.config.name:
                result = ueditorConfig.config;

                break;
            default:
                result = {
                    'state': 'Fail',
                    'message': 'need action'
                }
                break;
        }
        this.ctx.body = result;


    };
}

module.exports = upload;
