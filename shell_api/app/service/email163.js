'use strict';
const Service = require('egg').Service;

const nodemailer = require('nodemailer');
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    secureConnection: true,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: "chinacnhmail@163.com", // generated ethereal user
        pass: "chinacnhmail1234" // generated ethereal password
    }
});

class Email163 extends Service {

    /**
     * 根据邮件记录Id发送邮件
     * @param {string[]} recordIds 
     */
    async batchSendEmail(recordIds) {
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
            let emailContents = await this.ctx.service.cnhEmailrecord.searchRecordByIds(tempRecordIds);
            if (!emailContents || emailContents.length < 1) {
                result.message = "can not get email content record";
                return result;
            }
            let userEmailRecords = await this.ctx.service.cnhUseremailrecord.searchRecordByIds(tempRecordIds);
            if (!userEmailRecords || userEmailRecords.length < 1) {
                result.message = "user eamil record is empty";
                return result;
            }

            userEmailRecords.forEach(element => {
                let emailcontent = emailContents.find((m) => m.Id === element.EmailRecordId);
                console.log("emailcontent===,j%", JSON.stringify(emailcontent));
                if (emailcontent && emailcontent != undefined && emailcontent.Subject && emailcontent.Subject.length > 0) {
                    this.ctx.service.email163.sendMail({
                        from: 'chinacnhmail@163.com', // emailcontent.SendFrom sender address
                        to: element.SendTo, // list of receivers 258120306@qq.com,su-4353@163.com
                        subject: emailcontent.Subject, // Subject line
                        //text: icode, // plain text body
                        html: '<html>' + emailcontent.TemplateContent + '</html>' //emailcontent.TemplateContent 必须包含html标签
                    }, element);
                    totalSent = totalSent + 1;
                } else {
                    failSent = failSent + 1;
                }
            });

            result.success = true;
            result.totalSent = totalSent;
            result.failSent = failSent;
        } catch (ex) {
            this.ctx.logger.error('batchSendEmail-erorr:', ex, {
                Ids: JSON.stringify(recordIds)
            });
        }
        return result;
    }

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    async sendMail(mailOptions, userEmailRecord) {
        console.log('userEmailRecord: %s', JSON.stringify(userEmailRecord));
        let _self = this.ctx;
        try {
            await transporter.sendMail(mailOptions, function(error, info) {
                console.log('sendMail--info: %s', JSON.stringify(info));
                if (error) {
                    console.log("error===" + error);
                    //tempResult = false;
                    return false;
                } else if (userEmailRecord && userEmailRecord != null && userEmailRecord.Id.length > 0) {
                    userEmailRecord.State = 1;
                    userEmailRecord.UpdateTime = Date.now();
                    _self.service.cnhUseremailrecord.edit(userEmailRecord);
                }
            });
            return true;
        } catch (ex) {
            console.log('sendMail: %s', JSON.stringify(ex));
            this.ctx.logger.error('sendMail-erorr:', ex, {
                mailOptions: JSON.stringify(mailOptions)
            });
        }
        return false
    }

}

module.exports = Email163;