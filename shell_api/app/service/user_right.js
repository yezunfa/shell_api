'use strict';
const Sequelize = require('sequelize');
const _ = require('lodash');
const uuid = require('uuid');
const utils = require('../utils/index');

/**
 * SysrolesyspersonService
 * useage: ctx.service.sysrolesysperson
 */

const Service = require('egg').Service;

class UserRight extends Service {

    /**
     * 获取所有menu
     */
    async getAllMenuAndOperation() {
        try {
            const menuListQuery = await this.ctx.service.sysmenu.search(null, null, [
                ['Sort', 'desc'],
                ['CreateTime', 'desc']
            ]);

            if (menuListQuery.count === 0 || menuListQuery.rows.lenght === 0) {
                console.log('add menu first');
                return null;
            }

            const menuList = JSON.parse(JSON.stringify(menuListQuery.rows));

            const menuOpertionList = await this.ctx.model.query('select s_m_o.SysMenuId, s_m_o.SysOperationId,  s_o.Name, s_o.Function, s_o.Iconic from sysmenusysoperation  s_m_o left join sysoperation s_o on  s_m_o.SysOperationId = s_o.Id', {
                type: Sequelize.QueryTypes.SELECT
            });


            const showOperationQuery = await this.ctx.service.sysoperation.search(null, {
                Function: 'Show'
            }, null);
            let showOperation = showOperationQuery && showOperationQuery.rows && showOperationQuery.rows.length ? showOperationQuery.rows[0].dataValues : null;
            if (showOperation) {
                showOperation.SysOperationId = showOperation.Id; // 配合后面saveRoleRight取统一的字段
            }

            // default is false
            let enbale = false;
            _.forEach(menuList, (menu) => {

                menu.operations = null;
                for (var j = 0; j < menuOpertionList.length; j++) {
                    let op = menuOpertionList[j];
                    op.enable = enbale;

                    if (op.SysMenuId === menu.Id) {
                        menu.operations = menu.operations || {};
                        menu.operations[op.Function] = op;
                    }
                }

                // 如果menu没有设置相关operation，则添加显示action
                if (!menu.operations && showOperation) {
                    showOperation.enable = enbale;
                    menu.operations = {
                        "Show": showOperation
                    }
                }
            })
            return menuList;

        } catch (err) {
            throw err;
        }
    }

    /**
     * 获取所有menu tree
     */
    async getAllMenuAndOperationTree() {
        let menuList = await this.ctx.service.userRight.getAllMenuAndOperation();
        let menuTree = utils.arrayToTree(menuList);

        return menuTree;
    }

    /**
     * 根据SysPersonId用户ID获取他的所有角色
     * @param {String} SysPersonId 
     */
    async getUserRoleList(SysPersonId) {
        const sql = `select sysrole.* 
        from sysrole, sysrolesysperson 
        where sysrole.Id = sysrolesysperson.SysRoleId 
        and sysrolesysperson.SysPersonId=:SysPersonId`;

        const dataListQuery = await this.ctx.model.query(sql, {
            replacements: {
                SysPersonId: SysPersonId
            },
            type: Sequelize.QueryTypes.SELECT
        });
        return dataListQuery;
    }

     /**
     * 根据SysPersonId用户ID获取他的所有角色对应用的操作
     * @param {String} SysPersonId 
     */
    async getUserMenuOperationList(SysPersonId) {
        const sql = `
        select distinct  s_m_o.SysMenuId,s_m_o.SysOperationId, s_o.* 
        from 
            sysmenusysrolesysoperation s_m_o, sysoperation s_o 
        where 
            s_m_o.SysOperationId = s_o.Id 
        and s_m_o.SysRoleId in (
                select sysrole.Id from sysrole, sysrolesysperson 
                where sysrole.Id = sysrolesysperson.SysRoleId 
                and sysrolesysperson.SysPersonId=:SysPersonId
            )
        group by s_m_o.SysMenuId, s_m_o.SysOperationId`;

        const dataListQuery = await this.ctx.model.query(sql, {
            replacements: {
                SysPersonId: SysPersonId
            },
            type: Sequelize.QueryTypes.SELECT
        });
        return dataListQuery;
    }

     /**
     * 根据SysRoleId 获取角色对应用的操作
     * @param {String} SysRoleId 
     */
    async getRoleMenuOperationList(SysRoleId) {
        const sql = `
        select distinct  s_m_o.SysMenuId,s_m_o.SysOperationId, s_o.* 
        from 
            sysmenusysrolesysoperation s_m_o, sysoperation s_o 
        where 
            s_m_o.SysOperationId = s_o.Id 
        and s_m_o.SysRoleId = :SysRoleId
        group by s_m_o.SysMenuId, s_m_o.SysOperationId`;

        const dataListQuery = await this.ctx.model.query(sql, {
            replacements: {
                SysRoleId: SysRoleId
            },
            type: Sequelize.QueryTypes.SELECT
        });
        return dataListQuery;
    }




    /**
     * 删除一个角色
     */
    async removeRole() {

    }

    /**
     * 获取角色权限
     */
    async getRoleRight(SysRoleId) {
        let menuList = await this.ctx.service.userRight.getAllMenuAndOperation();
        let menuOperationList = await this.ctx.service.userRight.getRoleMenuOperationList(SysRoleId);
        _.each(menuList, (menu) => {
            for(var i=0; i< menuOperationList.length; i++) {
                let mp = menuOperationList[i];
                if(mp.SysMenuId === menu.Id) {
                    // 存在记录则说明有权限
                    mp.enable = true;
                    menu.operations[mp['Function']] = mp;
                }
            }
        });

        return menuList;
    }

     /**
     * 获取角色权限(Tree)
     */
    async getRoleRightTree(SysRoleId) {
        let menuList = {}
        let menuTree = {}

        if (!SysRoleId) {
            menuList = await this.ctx.service.userRight.getAllMenuAndOperation();
            menuTree = utils.arrayToTree(menuList);
            return menuTree;
        }

        menuList = await this.ctx.service.userRight.getRoleRight(SysRoleId);
        menuTree = utils.arrayToTree(menuList);

        return menuTree;
    }

    /**
     * 保存当前角色
     */
    async saveRoleRight(SysRoleId, menuList) {
        // 将sysmenusysrolesysoperation 所有数据删除
        // 根据 menuList 中设置有权限的数据重新生成
        try {
            const deleteRoleData = await this.ctx.model.query('delete from sysmenusysrolesysoperation where SysRoleId=:SysRoleId', {
                replacements: {
                    SysRoleId: SysRoleId
                },
                type: Sequelize.QueryTypes.DELETE
            });

            for (var i = 0; i < menuList.length; i++) {
                let menu = menuList[i];
                if (menu.operations && JSON.stringify(menu.operations) !== '{}') {

                    for (var o in menu.operations) {
                        // todo: bultcreate
                        if (menu.operations[o].enable) {
                            let entity = await this.ctx.service.sysmenusysrolesysoperation.create({
                                Id: uuid.v4(),
                                SysMenuId: menu.Id,
                                SysOperationId: menu.operations[o].SysOperationId,
                                SysRoleId: SysRoleId,
                                Valid: 1,
                                CreateTime: Date.now(),
                                CreatePerson: "admin"
                            }).catch(ex => {
                                console.log(ex);
                            })
                        }
                    }
                }
            };

            return true;

        } catch (ex) {
            throw err;
        }


    }

    /**
     * 获取当前用户菜单权限
     */
    async getUserMenuOperationRight(SysPersonId) {
        let menuList = await this.ctx.service.userRight.getAllMenuAndOperation();
        
        let menuOperationList = await this.ctx.service.userRight.getUserMenuOperationList(SysPersonId);
        _.each(menuList, (menu) => {
           
            for(var i=0; i< menuOperationList.length; i++) {
                let mp = menuOperationList[i];
                if(mp.SysMenuId === menu.Id) {
                    // 存在记录则说明有权限
                    mp.enable = true;
                    menu.operations[mp['Function']] = mp;
                }
            }
        });

        return menuList;
    }

    /** 
     * 获得当前用户请求的页面的权限
     */
    async getCurUserOperation(paramUrl) {
        let ctx = this.ctx;
        // let urlArr = ctx.request.header.referer.split('//')[1].split('/');
        // urlArr.shift();
        // let referers = '';
        // for (let index = 0; index < urlArr.length; index++) {
        //     const element = urlArr[index];
        //     referers = `${referers}/${element}`
        // }
        if (ctx.session.user && ctx.session.user.Id) {
            // 获取当前页面的操作权限
            let userMenuOperation = await ctx.service.userRight.getUserMenuOperationRight(ctx.session.user.Id);
            for (var i = 0; i < userMenuOperation.length; i++) {
                let menu = userMenuOperation[i];
                if (menu.Url && menu.Url.indexOf(paramUrl?paramUrl:ctx.request.url) > -1) {
                    return menu.operations;
                }
            }
        }
        return {};
    }
}


module.exports = UserRight;
