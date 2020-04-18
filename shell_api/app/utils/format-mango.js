/**
 * 处理表单接口参数
```javascript
var { $sort, $query, $pagination } = handlelTableParams(ctx.query, {
    $sort: [['Type', 'asc']],
    $query: { Valid: 1 },
    $pagination: { current: 1, pageSize: 10 }
})
```
 */

exports.handlelTableParams = (params, init) => {
    const { pagination, query, sort, join } = params
    let { $query, $pagination, $sort, $join } = init
    if (pagination) {
        try {
            $pagination = Object.assign($pagination || {}, JSON.parse(pagination))
        } catch (error) {
            throw Error({
                message: 'pagination参数错误',
                detail: `
                    In: controller.member.searchVIP
                    ${error}
                `
            })
        }
    }
    if (query) {
        try {
            $query = Object.assign($query || {}, JSON.parse(query))
        } catch (error) {
            throw Error({
                message: 'query参数错误',
                detail: `
                    In: controller.member.searchVIP
                    ${error}
                `
            })
        }
    }
    if (sort) {
        try {
            if (!$sort instanceof Array) $sort = []
            $sort = $sort.concat(JSON.parse(sort));
        } catch (error) {
            throw Error({
                message: 'sort参数错误',
                detail: `
                    In: controller.member.searchVIP
                    ${error}
                `
            })
        }
    }
    if (join) {
        try {
            // join = { table: { on: [], query: {} } }
            $join = Object.assign($join || {}, JSON.parse(join));
        } catch (error) {
            throw Error({
                message: 'sort参数错误',
                detail: (
                    `In: controller.member.searchVIP
                    ${error}`
                )
            })
        }
    }
    return { $query, $pagination, $sort, $join }
}

exports.digitUppercase = number => {
    const fraction = ['角', '分'];
    const digit = [ '零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const unit = [
        ['元', '万', '亿'],
        ['', '拾', '佰', '仟']
    ];
    const head = number < 0 ? '欠' : '';
    number = Math.abs(number);
    let str = '';
    for (let index = 0; index < fraction.length; index++) {
        str += (digit[Math.floor(number * 10 * Math.pow(10, index)) % 10] + fraction[index]).replace(/零./, '');
    }
    str = str || '整';
    number = Math.floor(number);
    for (let index = 0; index < unit[0].length && number > 0; index++) {
        let paragraph = '';
        for (let i = 0; i < unit[1].length && number > 0; i++) {
            paragraph = digit[number % 10] + unit[1][i] + paragraph;
            number = Math.floor(number / 10);
        }
        str = paragraph.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][index] + str;
    }
    return head + str.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
};