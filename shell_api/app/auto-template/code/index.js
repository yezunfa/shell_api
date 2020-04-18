'use strict';
const ApprovalProcess = require('./approval-process');
/**
 * 审核方式
 */

let CODE = {};
CODE.ApprovalWay = {
    title: "审核方式",
    default: "auto",
    auto: {
        code: 0,
        name: "自动审核",
    },
    byhand: {
        code: 1,
        name: "人工审核"
    }
};

CODE.ContactTimeLimit = {
    title: "合约期限",
    default: "auto",
    mouth3: {
        code: 3,
        name: "3个月",
    },
    mouth6: {
        code: 6,
        name: "6个月",
    },
    year1: {
        code: 12,
        name: "1年",
    },
    year2: {
        code: 24,
        name: "2年",
    },
}

/**
 * 对账方式
 */
CODE.CheckedWay = {
    title: "对账方式",
    default: "auto",
    auto: {
        code: 0,
        name: "自动对账",
    },
    byhand: {
        code: 1,
        name: "人工对账"
    }
};


/**
 * 数据是否有效
 */
CODE.Valid = {
    title: "是否有效",
    default: "valid",
    valid: {
        code: 1,
        name: "有效"
    },
    invalid: {
        code: 0,
        name: "无效"
    },
};

/**
 * 是否限售
 */
CODE.TimeLimitSale = {
    title: "是否限售",
    default: "no",
    yes: {
        code: 1,
        name: "是"
    },
    no: {
        code: 0,
        name: "否"
    },
}

/**
 * 是否限购
 */
CODE.LimitSale = {
    title: "是否限购",
    default: "no",
    yes: {
        code: 1,
        name: "是"
    },
    no: {
        code: 0,
        name: "否"
    },
}


/**
 * 审核状态
 * 对于提现，
 */
CODE.Approval = {
    title: "审核状态",
    default: "pending",
    pending: {
        code: 0,
        name: "待处理",
    },
    pendingActive: {
        code: 3,
        name: "待运营审核",
    },
    success: {
        code: 1,
        name: "审核通过"
    },
    cancel: {
        code: 2,
        name: "取消/拒绝"
    },
    recheck: {
        code: 4,
        name: "异常单/人工处理"
    }
};

/**
 * 是否上下架
 */
CODE.IsOnShelf = {
    title: "是否上下架",
    default: "off",
    off: {
        code: 0,  
        name: "未上架"
    },
    on: {
        code: 1,  
        name: "已上架"
    }
}

/**
 * 支付方式
 */
CODE.PaymentType = {
    title: "支付方式",
    default: "btc",
    btc: {
        code: 1,  
        name: "BTC"
    },
    cny: {
        code: 2,
        name: "HAC"
    },
    hac: {
        code: 4,
        name: "CNY"
    }
}

/**
 * 购买算力状态
 */
CODE.PowerState = {
    title: "算力账单状态",
    default: "pending",
    pending: {
        code: 0, // 待对账
        name: "待对账"
    },
    bought: {
        code: 1,
        name: "已购买/冻结"
    },
    working: {
        code: 2,
        name: "生效中"
    },
    expired: {
        code: 3,
        name: "已失效"
    },
    recheck: {
        code: 4,
        name: "异常单/人工处理"
    }
};

/**
 * 交易状态
 */
CODE.TradeState = {
    title: "交易状态",
    default: "pending",
    pending: {
        code: 0,
        name: "待交易",
    },
    success: {
        code: 1,
        name: "交易成功"
    },
    sending: {
        code: 2,
        name: "交易提交"
    },
    sended: {
        code: 3,
        name: "交易提交成功"
    },
    accepted: {
        code: 4,
        name: "交易接受"
    },
    error: {
        code: 5,
        name: "交易异常"
    }
};

/**
 * 对账状态
 */
CODE.Checked = {
    title: "对账状态",
    default: "pending",
    pending: {
        code: 0,
        name: "待对账",
    },
    success: {
        code: 1,
        name: "对账成功"
    }
};

CODE.generateComponent = (field) => {
    let enums = [];
    for (var f in CODE[field]) {
        if (f !== "title" && f !== "default") {
            let fd = CODE[field][f];
            enums.push({
                label: fd.name,
                value: fd.code
            });
        }
    }

    return `
        <Field 
            type="${ enums.length === 2 ? "number\"  x-component=\"radio" : "string"}"
            name="${field}"
            enum= {
              ${JSON.stringify(enums)}  
            }
            title="${CODE[field].title}"
        />
    `
}

CODE.generateEnumTableColum =  (field) => {
    let enums = [];
    for (var f in CODE[field]) {
        if (f !== "title" && f !== "default") {
            let fd = CODE[field][f];
            enums.push(`
                <If condition={record["${field}"] === ${fd.code}}>
                    ${fd.name}
                </If>
            `);
        }
    }

    return `
            <Table.Column
            title="${CODE[field].title}"
            width={160}
            cell={(value, index, record) => {
                return (<span className={ "${field}_enum_" + record.${field} }>
                    ${enums.join('')}
                </span>)
            } }
        />
    `;
}

/**
 * 审核action 
 */
CODE.generateApprovalAction = (tablename) => {
    return ApprovalProcess.generateApprovalAction(tablename);
}

/**
 * 详情中的审核脚本
 */
CODE.getDetailApprovalMethods = (tablename) => {
    return ApprovalProcess.getDetailApprovalMethods(tablename);
}

/**
 * 详情中的审核表单
 */
CODE.getDetailApprovalForm = (tablename) => {
    return ApprovalProcess.getDetailApprovalForm(tablename);
}


module.exports = CODE;
