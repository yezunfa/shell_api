'use strict';
/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('cart', {
    Id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      comment: '购物车ID'
    },
    UserId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '会员id'
    },
    ProductId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '产品id'
    },
    ParentId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '主键'
    },
    Amount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: '加入购物车商品数量'
    },
    Valid: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
      comment: '是否有效（0:失效/过期，1:正常）'
    },
    Sort: {
      type: DataTypes.INTEGER(2),
      allowNull: true,
      comment: '购物车顺序'
    },
    CreateTime: {
      type: DataTypes.DATE(6),
      allowNull: true,
      comment: '创建时间'
    },
    State: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
      comment: '购物车状态(1:正常, 2:已提交订单，3:已完成订单，4:已移除)'
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
    tableName: 'cart',
    timestamps: false
  });

  Model.associate = function() {

  }

  return Model;
};
