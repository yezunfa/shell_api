'use strict';
/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('order_main', {
    Id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      comment: '主键'
    },
    Name: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '订单名称'
    },
    Code: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '订单号'
    },
    CartId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '购物车主id'
    },
    UserId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'member',
        key: 'Id'
      },
      comment: '会员id'
    },
    Mobile: {
      type: DataTypes.STRING(18),
      allowNull: true,
      comment: '会员手机号'
    },
    LinkName: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '联系人姓名'
    },
    LinkMobile: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '联系人手机'
    },
    Type: {
      type: DataTypes.INTEGER(2),
      allowNull: true,
      defaultValue: '1',
      comment: '订单类型(1. 服务购买 2. 实物购买 3. 会员卡/充值)'
    },
    Price: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: '实收金额'
    },
    TotalPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: '应收金额'
    },
    PayWay: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      comment: '支付方式(1. 微信，2. 微信+优惠）)'
    },
    PayState: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0',
      comment: '支付状态(0未支付、1已经支付、2分期付款中)'
    },
    State: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
      comment: '订单状态(1正常，0删除，2，退款, 3异常）'
    },
    Remark: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '备注'
    },
    Valid: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
      comment: '是否有效'
    },
    CreateTime: {
      type: DataTypes.DATE(6),
      allowNull: true,
      comment: '创建时间'
    },
    CreatePerson: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '创建人'
    },
    UpdateTime: {
      type: DataTypes.DATE(6),
      allowNull: true,
      comment: '更新时间'
    },
    UpdatePerson: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '更新人'
    }
  }, {
    tableName: 'order_main',
    timestamps: false
  });

  Model.associate = function() {

  }

  return Model;
};
