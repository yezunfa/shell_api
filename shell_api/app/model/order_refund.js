'use strict';
/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('order_refund', {
    Id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      comment: '主键'
    },
    OrderId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'order_main',
        key: 'Id'
      },
      comment: '订单id'
    },
    RefundCode: {
      type: DataTypes.STRING(36),
      allowNull: true,
      unique: true,
      comment: '退款单号'
    },
    Amount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: '退款金额'
    },
    Reason: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '退款原因'
    },
    ApplicationDate: {
      type: DataTypes.DATE(6),
      allowNull: false,
      comment: '申请日期'
    },
    ProcessingDate: {
      type: DataTypes.DATE(6),
      allowNull: true,
      comment: '处理日期'
    },
    State: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      defaultValue: '0',
      comment: '状态'
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
    tableName: 'order_refund',
    timestamps: false
  });

  Model.associate = function() {

  }

  return Model;
};
