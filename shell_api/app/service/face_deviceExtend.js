'use strict';
const uuid = require('uuid')
const base64Img = require('base64-img');
 

/**
 * FaceDeviceService
 * useage: ctx.service.face_device
 */

const Service = require('egg').Service;

class FaceDeviceService extends Service {

    /**
     * create a new face_device
     * @param {Object} entity model face_device
     * @return {Object} entity a model Entity
     */
    async saveFaceImg(newEntity) {
        try {
            if(newEntity.faceImg) {
                let  base64Str = `data:image/png;base64,${newEntity.faceImg.replace(/\n/g, '')}`;
                let filename = `${uuid.v4()}`
                const imgPath = base64Img.imgSync(base64Str, this.config.imgServer.savePath + '/face/', filename);
                this.ctx.logger.info('imgPath:',imgPath)
                const faceImg = this.config.imgServer.host + 'face/' + filename + '.png';

                try{
                    // 会员
                    const updateMemberImgSql = `update member set face=:faceImg where Mobile=:Mobile or CertificateCode=:CertificateCode`;
                    this.ctx.model.query(updateMemberImgSql, {
                        type: this.ctx.model.Sequelize.QueryTypes.UPDATE,
                        replacements: {
                            faceImg,
                            Mobile: newEntity.phone || 'mock_mock_mock_mock', // 防止sql报错
                            CertificateCode: newEntity.idcard || 'mock_mock_mock_mock',
                        }
                    });
                    // 员工
                    const updateUserImgSql = `update sys_user set face=:faceImg where LoginName=:Mobile or CertificateNumber=:CertificateCode`;
                    this.ctx.model.query(updateUserImgSql, {
                        type: this.ctx.model.Sequelize.QueryTypes.UPDATE,
                        replacements: {
                            faceImg,
                            Mobile: newEntity.phone  || 'mock_mock_mock_mock',
                            CertificateCode: newEntity.idcard  || 'mock_mock_mock_mock',
                        }
                    });
                   
                } catch(ex) {
                    this.ctx.logger.error('update 会员或员工face失败', ex)
                }
             
                return faceImg;
            }
        } catch (err) {
            throw err;
        }
    }

}

module.exports = FaceDeviceService;
