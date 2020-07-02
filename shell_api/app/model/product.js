'use strict';
/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('product', {
    Id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      comment: '主键'
    },
    Type: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '产品类型'
    },
    Name: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '产品名'
    },
    EnName: {
      type: DataTypes.STRING(128),
      allowNull: true,
      comment: '产品英文名'
    },
    BannerList: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      comment: '产品图片'
    },
    Price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      comment: '普通价'
    },
    MemberPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: '会员价'
    },
    Summary: {
      type: DataTypes.STRING(2000),
      allowNull: true,
      comment: '产品简介'
    },
    Introduce: {
      type: DataTypes.STRING(5000),
      allowNull: true,
      comment: '产品介绍'
    },
    Notice: {
      type: DataTypes.STRING(8000),
      allowNull: true,
      comment: '注意事项'
    },
    Detail: {
      type: DataTypes.STRING(5000),
      allowNull: true,
      comment: '产品细节'
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
    tableName: 'product',
    timestamps: false
  });

  Model.associate = function() {

  }

  return Model;
};
