'use strict';
const Excel = require('exceljs');

/**
 * useage: ctx.service.utils.excel
 */
const {
    sqlHelper
} = require('../../utils/index');
const Service = require('egg').Service;

class IndexService extends Service {

    /**
     * @param options {Object} 
     * @param options.title { String } 
     * @param options.rowsName  {Array}   label: "用户账号", value: "UserId"
     * @param options.data  {Array}
     * @param options.sort  {bool}
     */
    async commonEexcel(options) {
        let {
            title,
            rowsName,
            data,
            sort
        } = options,
        fills = {},
            excelOptions = {
                base64: true
            };

        try {
            let workbook = new Excel.Workbook();
            // 添置排名字段
            if (data.length && sort) {
                let len = data.length;
                for (var i = 0; i < len; i++) {
                    data[i]["Sort"] = i + 1;
                }
            }

            //add header
            let ws1 = workbook.addWorksheet(title),
                rowsLabel = [],
                rowsValue = [];

            rowsName.forEach(item => {
                rowsLabel.push(item.label);
                rowsValue.push(item.value);
            });
            // 写入label, 标题
            ws1.addRow(rowsLabel);
            // 写入每行数据
            data.forEach(item => {
                let row = [];
                rowsValue.forEach(_it => {
                    row.push(item[_it]);
                });
                ws1.addRow(row);
            })

            this.ctx.set('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            this.ctx.set('Content-disposition', `attachment; filename=${encodeURIComponent(title)}.xlsx`)
            this.ctx.set('Set-Cookie', 'fileDownload=true; path=/')

            this.ctx.body = await workbook.xlsx.writeBuffer(excelOptions);
        } catch (err) {
            console.log('service/utils/excel.js/commonEexcel' + err);
            throw err;
        }


    }

    async getUserIds(mobile) {
        let _mobile = mobile && mobile.UserId && !isNaN(parseInt(mobile.UserId)) ? parseInt(mobile.UserId) : `${mobile.UserId}`;
        let sql = `
                select Id from cnh_user
                where Mobile like '%${_mobile}%'
            `;
        let Id = await this.ctx.model.query(sql, {
            type: this.ctx.model.Sequelize.QueryTypes.SELECT
        });
        let Ids = [];
        Id.forEach(element => {
            Ids.push(element.Id);
        });
        // if(!mobile.UserId){
        //     return null;
        // }
        if (Ids.length > 0 && Ids && Ids instanceof Array) {
            return Ids;
        }
        return mobile.UserId;
    }

}

module.exports = IndexService;
