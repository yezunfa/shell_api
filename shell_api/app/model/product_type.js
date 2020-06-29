'use strict';
/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('product_type', {
    Id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      comment: '主键'
    },
    ParentId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '父类型'
    },
    Name: {
      type: DataTypes.STRING(36),
      allowNull: false,
      defaultValue: '',
      comment: '类型名称'
    },
    EnName: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '英文名'
    },
    Banner: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '图片'
    },
    State: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
      comment: '状态'
    },
    Sort: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      defaultValue: '0',
      comment: '序号'
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
    tableName: 'product_type',
    timestamps: false
  });

  Model.associate = function() {

  }

  return Model;
};
