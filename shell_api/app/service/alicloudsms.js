'use srtict';
const Service = require('egg').Service;

const SMSClient = require('@alicloud/sms-sdk')
    // ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = 'zbEwqQ6NXR28GHA5'
const secretAccessKey = 'AjsL3ObFQyzGowjVCagZDNHueuLaoq';
//在云通信页面开通相应业务消息后，就能在页面上获得对应的queueName,不用填最后面一段
const queueName = 'Alicom-Queue-1092397003988387-'

//初始化sms_client
const smsClient = new SMSClient({
    accessKeyId,
    secretAccessKey
})

class AlicloudSms extends Service {

    /**
     * 根据短信记录Id发送短信
     * @param {string[]} recordIds from cnh_MessageRecord
     */
    async batchSendMessage(recordIds) {
        let _self = this;
        let totalSent = 0;
        let failSent = 0;
        let result = {
            success: false,
            totalSent: 0,
            failSent: 0,
            message: ""
        };
        try {
            if (!recordIds || recordIds.length < 1) {
                result.message = "ids can not be empty";
                return result;
            }
            let tempRecordIds = [];
            recordIds.forEach(element => {
                let isexists = tempRecordIds.find(m => m === element);
                if (isexists === undefined || !isexists) {
                    tempRecordIds.push(element);
                }
            })
            let messageContents = await this.ctx.service.cnhMessagerecord.searchRecordByIds(tempRecordIds);
            if (!messageContents || messageContents.length < 1) {
                result.message = "can not get message content record";
                return result;
            }
            let userMessageRecords = await this.ctx.service.cnhUsermessagerecord.searchRecordByIds(tempRecordIds);
            if (!userMessageRecords || userMessageRecords.length < 1) {
                result.message = "user message record is empty";
                return result;
            }

            messageContents.forEach(async contentDetail => {
                let countIndex = 0;
                let cellPhones = [];
                let userMessageRecordIds = [];
                userMessageRecords.forEach(async element => {
                    if (countIndex > 999) {
                        try {
                            let tempResult = await this.ctx.service.alicloudsms.sendbatchsms(
                                cellPhones.join(','), contentDetail.Content, userMessageRecordIds);
                            if (tempResult && tempResult === "OK") {
                                //处理返回参数
                                if (userMessageRecordIds && userMessageRecordIds.length > 0) {
                                    await this.ctx.service.cnhUsermessagerecord.updateRecordByIds(userMessageRecordIds);
                                }
                            }
                        } catch (ex) {
                            console.log("tempResult ex 1===,j%", JSON.stringify(ex));
                        }

                        totalSent = totalSent + cellPhones.length;
                        cellPhones = [];
                        userMessageRecordIds = [];
                        countIndex = 0;
                    }
                    cellPhones.push(element.CellPhone);
                    userMessageRecordIds.push(element.Id);
                    countIndex = countIndex + 1;
                });
                if (cellPhones.length > 0) {
                    try {
                        let tempResult = await _self.ctx.service.alicloudsms.sendbatchsms(
                            cellPhones.join(','), contentDetail.Content, userMessageRecordIds);
                        if (tempResult && tempResult === "OK") {
                            //处理返回参数
                            if (userMessageRecordIds && userMessageRecordIds.length > 0) {
                                await this.ctx.service.cnhUsermessagerecord.updateRecordByIds(userMessageRecordIds);
                            }
                        }
                    } catch (ex) {
                        console.log("tempResult ex 2===,j%", JSON.stringify(ex));
                    }
                    totalSent = totalSent + cellPhones.length;
                }
                if (countIndex < 1) {
                    failSent = failSent + 1;
                }
            });

            result.success = true;
            result.totalSent = totalSent;
            result.failSent = failSent;
        } catch (ex) {
            this.ctx.logger.error('batchSendMessage-erorr:', ex, {
                Ids: JSON.stringify(recordIds)
            });
        }
        return result;
    }

    /**
     * 发送短信短信内容 
     * @param phoneNumbers {String} 支持以逗号分隔的形式进行批量调用，批量上限为1000个手机号码
     * @param content {String} 短信内容
     */
    async sendbatchsms(phoneNumbers, content, userMessageRecordIds) {
        //console.log("get in parameters,j%", phoneNumbers, content, userMessageRecordIds)
        try {
            return smsClient.sendSMS({
                PhoneNumbers: phoneNumbers,
                SignName: '中国算力',
                TemplateCode: 'SMS_148080244', //TODO sudy 需要短信发送独立的模板Code  SMS_139241295
                TemplateParam: `{"msg": "${content}"}`  // code 替换 msg
            }).then(
                function(res) {
                    let {
                        Code
                    } = res
                    console.log("res=== j%", res)
                    if (Code === 'OK') {
                        return "OK";
                    } else {
                        return "Fail";
                    }
                }, ex => {
                    console.log(ex);
                    this.ctx.logger.error('发送短信异常 %j', phoneNumbers, code, ex);
                    return "Fail";
                });
        } catch (ex) {
            console.log("AlicloudSms-sendbatchsms-erorr, j%", ex);
            this.ctx.logger.error('AlicloudSms-sendbatchsms-erorr:', ex, {
                phoneNumbers: phoneNumbers
            });
        }
        return "Fail";
    }
}
module.exports = AlicloudSms;