const {
    app,
    assert,
} = require('egg-mock/bootstrap');
const uuid = require('uuid');
const dataManager  = require('./data-manager');
const arrayToTree = require('./array-to-tree');

before(async () => {
    
})

describe('Init data', () => {
    it('it should clear all the data of sysmenu,cnh_product', async () => {
        const ctx = app.mockContext({});
        await ctx.model.query("SET foreign_key_checks=0");
        await ctx.model.query("delete from sysdepartment");
        await ctx.model.query("delete from sysrolesysperson");
        await ctx.model.query("delete from sysperson");
        await ctx.model.query("delete from sysrole");
        await ctx.model.query("delete from sysmenu");
        await ctx.model.query("delete from sysoperation");
        await ctx.model.query("delete from sysmenusysoperation");
        // await ctx.model.query("delete from cnh_product");
        await ctx.model.query("SET foreign_key_checks=1");
    });

    // 同步问题，外键原因，需求写在同一个方法里
    it('it should init data of sysmenu/ sysoperation/ sysmenusysoperation', async () => {
        const ctx = app.mockContext({});
        const menuList = dataManager.getMenuEntityList();
        let result =  [];
        for(var i =0; i < menuList.length; i++) {
            menuList[i].CreateTime = Date.now();
            const newEntity = await ctx.service.sysmenu.create(menuList[i]);
            result.push(newEntity);     
        }
        assert(menuList.length === result.length);
 
 
        const entityList = dataManager.getSysoperation();
        result =  [];
        for(var i = 0; i < entityList.length; i++) {
            const newEntity = await ctx.service.sysoperation.create(entityList[i]);
            result.push(newEntity);     
        }
        assert(entityList.length === result.length);
 
   
        // const menuList = dataManager.getMenuEntityList();
        const operationList = dataManager.getSysoperation();
        let newEnity = function(menuId, operationId){
            return {
                Id: uuid.v4(),
                SysMenuId: menuId,
                SysOperationId: operationId,
                Valid: 1,
                CreateTime: Date.now(),
                CreatePerson: "admin",
                UpdateTime: Date.now(),
                UpdatePerson:"admin"
            }
        }

        
        // ["Create", "Edit", "Detail", "Delete", "Search", "Export", "Show", "Save"]
        let Operations = {};
        operationList.forEach(o => {
            Operations[o.Function] = o;
        });

        let sysmenusysoperation = [];
        for(var i = 0; i < menuList.length; i++) {
            let menu = menuList[i];
            // 不存在url，增加显示的operaion
            if(!menu.Url) {
                // 菜单分类
                sysmenusysoperation.push(newEnity(menu.Id, Operations['Show'].Id))
            } else if(/\/page\/.*\/manage/.test(menu.Url)) {
                // 管理页面
                sysmenusysoperation.push(newEnity(menu.Id, Operations['Show'].Id));
                sysmenusysoperation.push(newEnity(menu.Id, Operations['Search'].Id));
                sysmenusysoperation.push(newEnity(menu.Id, Operations['Create'].Id));
                sysmenusysoperation.push(newEnity(menu.Id, Operations['Export'].Id));
                sysmenusysoperation.push(newEnity(menu.Id, Operations['Detail'].Id));
                sysmenusysoperation.push(newEnity(menu.Id, Operations['Edit'].Id));
                sysmenusysoperation.push(newEnity(menu.Id, Operations['Delete'].Id));
            } else if(/\/page\/.*\/edit/.test(menu.Url)) {
                // 编辑页面
                sysmenusysoperation.push(newEnity(menu.Id, Operations['Save'].Id));
            } else {
                sysmenusysoperation.push(newEnity(menu.Id, Operations['Show'].Id));
                sysmenusysoperation.push(newEnity(menu.Id, Operations['Save'].Id));
            }
        }
 
        result = [];
        
        for(var j=0; j< sysmenusysoperation.length; j++) {
            let entity = await ctx.service.sysmenusysoperation.create(sysmenusysoperation[j]);
          
            result.push(entity);
        }
        
        assert(result.length === sysmenusysoperation.length)
        
    }); 



    it('it should get all menuList', async () => {
        const ctx = app.mockContext({});
        const menuList =  await ctx.service.sysmenu.search(null, null, [['Sort','desc']]);
        assert(menuList.rows.length > 0);
        
        let treeArray = JSON.parse(JSON.stringify(menuList.rows));
        let tree = arrayToTree(treeArray);

    });

    it('it should init data of sysdepartment', async () => {
        const ctx = app.mockContext({});
        const entityList = dataManager.getDepartmentList();
        let result =  [];
        for(var i = 0; i < entityList.length; i++) {
            const newEntity = await ctx.service.sysdepartment.create(entityList[i]);
            result.push(newEntity);     
        }
        assert(entityList.length === result.length);
    });

    it('it should init data of sysperson', async () => {
        const ctx = app.mockContext({});
        const entityList = dataManager.getSyspersionList();
        let result =  [];
        for(var i = 0; i < entityList.length; i++) {
            const newEntity = await ctx.service.sysperson.create(entityList[i]);
            result.push(newEntity);     
        }
        assert(entityList.length === result.length);
    });

    it('it should init data of sysrole', async () => {
        const ctx = app.mockContext({});
        const entityList = dataManager.getSysrole();
        let result =  [];
        for(var i = 0; i < entityList.length; i++) {
            const newEntity = await ctx.service.sysrole.create(entityList[i]);
            result.push(newEntity);     
        }
        assert(entityList.length === result.length);
    });

    it('it should init data of sysrolesysperson', async () => {
        const ctx = app.mockContext({});
        const entityList = dataManager.getSysrolesysperson();
        console.log(entityList);
        let result =  [];
        for(var i = 0; i < entityList.length; i++) {
            try{
                const newEntity = await ctx.service.sysrolesysperson.create(entityList[i]);
                result.push(newEntity);     
            } catch(ex) {
                console.log(ex);
            }
           
        }
        assert(entityList.length === result.length);
    });

});