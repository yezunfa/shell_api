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
    UserId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'member',
        key: 'Id'
      },
      comment: '会员id'
    },
    CartId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '购物车主id'
    },
    Type: {
      type: DataTypes.INTEGER(2),
      allowNull: true,
      defaultValue: '1',
      comment: '订单类型'
    },
    Amount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: '实收金额'
    },
    TotalAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: '应收金额'
    },
    PayWay: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      comment: '支付方式(1. 支付宝，2微信，3现金，4 微信+优惠）)'
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
    Source: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
      comment: '订单来源(1. 小程序，2.前台）'
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
