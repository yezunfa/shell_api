'use strict';

const Controller = require('egg').Controller;
const uuid = require('uuid')
 

class FaceDevice extends Controller {
    /**
     * 上传人脸识别数据
     * ex: /api/face-device/log
     */
    async Log() {
        let newEntity = this.ctx.request.body ;
        // this.ctx.logger.info(this.ctx.request.body, '上传人脸识别数据');
        if(newEntity.key !== '44d286e2-81bd-11e9-bc42-526af7764f64') {
            this.ctx.body = {
                success: false,
                code: 413,
                msg: '非法请求',
            }
            return;
        }

        try{
            newEntity.faceImg = await this.ctx.service.faceDeviceExtend.saveFaceImg(newEntity)
        }catch(ex) {
            this.ctx.logger.error('保存设备上传的图片异常', ex)
        }

        try {
           
            newEntity.Id = uuid.v4();
            // newEntity.Valid = 1;
            newEntity.CreateTime = Date.now();
            newEntity.CreatePerson = 'device';
            newEntity.UpdatePerson = 'device';
            newEntity.UpdateTime = Date.now();
            newEntity.storeid = newEntity.siteid
            // newEntity = this.ctx.validateAndFormat(newEntity, 'face_device');
        } catch (ex) {
            this.ctx.logger.error('face_device.log调用异常/validateAndFormat', ex);
            this.ctx.body = {
                success: false,
                code: 413,
                ex,
                msg: ex.message,
            }
            return;
        }

        try {
            const entity = await this.ctx.service.faceDevice.create(newEntity);
            this.ctx.body = {
                success: true,
                code: 200,
                msg: '成功',
                data: entity && entity.faceImg,
            }
        } catch (ex) {
            this.ctx.logger.error('faceDevice.createByApi调用异常/faceDevice.create', ex);
            this.ctx.body = {
                success: false,
                message: ex,
                code: 500,
                data: newEntity
            }
        }
    }
}

module.exports = FaceDevice;
