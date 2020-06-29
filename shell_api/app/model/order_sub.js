'use strict';
/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('order_sub', {
    OrderId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      defaultValue: '',
      references: {
        model: 'order_main',
        key: 'Id'
      },
      comment: '主订单id'
    },
    Id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      comment: '主键'
    },
    CartId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      defaultValue: '',
      comment: '购物车id'
    },
    ProductId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      defaultValue: '',
      comment: '产品id'
    },
    Price: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: '单价'
    },
    Count: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1',
      comment: '购买数量'
    },
    TotalPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: '总价'
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
    tableName: 'order_sub',
    timestamps: false
  });

  Model.associate = function() {

  }

  return Model;
};
