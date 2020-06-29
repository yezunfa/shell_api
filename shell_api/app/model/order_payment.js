'use strict';
/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('order_payment', {
    Id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      comment: '主键'
    },
    UserId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      defaultValue: '',
      comment: '会员id'
    },
    OrderId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      defaultValue: '',
      references: {
        model: 'order_main',
        key: 'Id'
      },
      comment: '订单id'
    },
    PayWay: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      comment: '支付方式'
    },
    Type: {
      type: DataTypes.STRING(36),
      allowNull: false,
      defaultValue: '0',
      comment: '支付类型'
    },
    PayTime: {
      type: DataTypes.DATE(6),
      allowNull: true,
      comment: '支付日期'
    },
    Amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      comment: '支付金额'
    },
    TransactionId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '微信支付单号'
    },
    State: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      defaultValue: '0',
      comment: '支付状态'
    },
    Valid: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
      comment: '是否有效'
    },
    Remark: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '备注'
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
    tableName: 'order_payment',
    timestamps: false
  });

  Model.associate = function() {

  }

  return Model;
};
