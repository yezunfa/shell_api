'use strict';

/**
 * 将树结构转换为数组
 */
let treeToArray = (array) => {

    if (!array) {
        throw Error("param should be array")
    }
    let entityList = [];

    for (var i = 0; i < array.length; i++) {
        let curEnity = array[i];
        let newEntity = {};
        for (var f in curEnity) {
            if (f !== 'children') {
                newEntity[f] = curEnity[f];
            }
        }
        entityList.push(newEntity);
        if (curEnity.children) {
            entityList = entityList.concat(treeToArray(curEnity.children))
        }
    }
    return entityList;
}

module.exports = treeToArray;