'use strict';

/**
 * 将数组转换为树结构
 */
let arrayToTree = (array, option) => {
    let config = Object.assign({
        rootParentId: null,
        ParentId: 'ParentId',
        Id: 'Id',
        children: "children"
    }, option)
    // 获得父节点
    let parentRoot = [];
    for(var i =0; i< array.length; i++ ){
        let m = array[i];
        if(m[config.ParentId] === config.rootParentId || m[config.ParentId] === '') {
            parentRoot.push(m)
        }
    }
     
    // 递归生成children
    let buildChildren = (arrayRoot, allArry) => {
        for(var i=0; i< arrayRoot.length; i++) {
            var children = [];
            for(var j=0; j < allArry.length; j++) {
                if(allArry[j][config.ParentId] === arrayRoot[i][config.Id]) {
                    children.push(allArry[j]);
                }   
            }
            
            if(children.length) {
                arrayRoot[i][config.children] = buildChildren(children, allArry)
            }
        }
        return arrayRoot;
    }
      
    parentRoot = buildChildren(parentRoot, array);
    return parentRoot;
}

module.exports = arrayToTree;