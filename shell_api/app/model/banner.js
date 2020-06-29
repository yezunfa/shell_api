'use strict';
/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('banner', {
    Id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      comment: '主键'
    },
    ProductId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      comment: '商品id'
    },
    SysUserId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      comment: '医生id'
    },
    Type: {
      type: DataTypes.STRING(2),
      allowNull: true,
      comment: '图片类型（1:商品， 2:人物， 3:门店图）'
    },
    BannerList: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      comment: '图片url'
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
    tableName: 'banner',
    timestamps: false
  });

  Model.associate = function() {

  }

  return Model;
};
