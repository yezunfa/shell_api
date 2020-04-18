'use strict';

/**
 * BTC账单类型类型
 */
exports.BTCBillTypes = { // 原来是  1 , 2 , 4 , 8
    deposit: 102, //充值
    withdrawdeposit: 122, //提现
    checkdrawdeposit: 121, // 提现审核
    cancelDrawdeposit: 123, // 取消提现
    createorder: 132, //合约认购      // --->>>反了
    earnings: 111 //合约收益        // --->>>反了
}
exports.BTCBillTypeNames = [{
    Value: 102,
    Name: "充值"
}, {
    Value: 122,
    Name: "提现"
}, {
    Value: 121,
    Name: "提现",
    Remark: '提现审核'
}, {
    Value: 123,
    Name: "提现",
    Remark: '取消提现'
}, {
    Value: 132,
    Name: "算力购买"
}, {
    Value: 111,
    Name: "算力收益"
}]


/**
 * HAC账单类型类型
 */
exports.HACBillTypes = { // 原来是  1 , 2 , 4 , 8, 16, 32, 64, 222
    registerRewards: 1, //注册
    deposit: 202, //充值
    withdrawdeposit: 212, //提现
    checkdrawdeposit: 211, // 提现审核  new
    cancelDrawdeposit: 213, // 取消提现
    createorder: 8, //合约收益
    InvitationRegisterRewards: 16, //推荐奖励
    InvitationProductBuyRewards: 32, //订购奖励
    BuyPowerRewards: 64, //购买算力激励
    // InvitationRegister: 128, //邀请注册奖励
    // InvitationProductBuy: 256 //邀请用户订购奖励
    Reward: 222, // hac奖励
    mining: 242 // hac挖矿奖励
}
exports.HACBillTypeNames = [{ // 原来是  1 , 2 , 4 , 8 , 16 , 32 , 64
    Value: 1,
    Name: "注册"
}, {
    Value: 202,
    Name: "充值"
}, {
    Value: 212,
    Name: "提现"
}, {
    Value: 211,
    Name: "提现",
    Remark: '提现审核'
}, {
    Value: 213,
    Name: "提现",
    Remark: '取消提现'
}, {
    Value: 8,
    Name: "合约收益"
}, {
    Value: 16,
    Name: "推荐奖励"
}, {
    Value: 32,
    Name: "订购奖励"
}, {
    Value: 64,
    Name: "购买算力激励"
}, { // 新增
    Value: 222,
    Name: '奖励成功'
}, {
    Value: 242,
    Name: '挖矿'
}]

/**
 * CNY账单类型类型
 */
exports.CNYBillTypes = {
    deposit: 2, //充值
    withdrawdeposit: 12, //提现
    checkdrawdeposit: 11, // 提现审核
    cancelDrawdeposit: 13, // 取消提现
    createorder: 22 //合约认购
}
exports.CNYBillTypeNames = [{ // 原来是  1 , 2, 4 
    Value: 2,
    Name: "充值"
}, {
    Value: 12,
    Name: "提现",
    Remark: '提现成功'
}, {
    Value: 11,
    Name: "提现",
    Remark: '提现审核'
}, {
    Value: 13,
    Name: "提现",
    Remark: '取消提现'
}, {
    Value: 22,
    Name: "算力购买"
}, {
    Value: 1,
    Name: "充值"  // 充值未到账
}]


/**
 * HAC账单类型类型
 */
exports.HACRewardsBillType = {
    InvitationRegister: 1,
    InvitationProductBuy: 2
}
exports.HACRewardsBillTypeNames = [{
    Value: 1,
    Name: "注册"
}, {
    Value: 2,
    Name: "订购"
}]

// 钱包明细查询字符串，用于优化过多的if else
exports.WalletType = {
    btc: 'btc',
    hac: 'hac',
    cny: 'cny'
};
exports.WalletQueryStr = {
    btc: {
        deposit: 'deposit',  // 充值
        drawDeposit: 'drawDeposit',  // 提现
        earing: 'earing',  // 算力收益
        order: 'order',  // 算力购买
        all: 'all'  // 全部
    },
    hac: {
        deposit: 'deposit', 
        drawDeposit: 'drawDeposit',
        mining: 'mining',  // 挖矿
        all: 'all'  
    },
    cny: {
        deposit: 'deposit', 
        drawDeposit: 'drawDeposit',
        order: 'order',
        all: 'all' 
    }
}

