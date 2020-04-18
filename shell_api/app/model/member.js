'use strict';
/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('member', {
    Id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      comment: '主键'
    },
    Code: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '会员编号'
    },
    Name: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '真实姓名'
    },
    NickName: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '昵称'
    },
    WechatName: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '微信名称'
    },
    WechatAmount: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '微信账号'
    },
    Avatar: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '头像'
    },
    Photo: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '照片'
    },
    Sex: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: '保密',
      comment: '性别'
    },
    Birthday: {
      type: DataTypes.DATE(6),
      allowNull: true,
      comment: '生日'
    },
    Mobile: {
      type: DataTypes.STRING(18),
      allowNull: true,
      unique: true,
      comment: '手机号'
    },
    Email: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '电子邮件'
    },
    CertificateType: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '证件类型'
    },
    CertificateCode: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '证件号'
    },
    Country: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '国家'
    },
    Province: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '省份'
    },
    City: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '城市'
    },
    Adress: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '详细地址'
    },
    Source: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '客户来源'
    },
    openid: {
      type: DataTypes.STRING(36),
      allowNull: true,
      unique: true,
      comment: '微信小程序openid'
    },
    unionid: {
      type: DataTypes.STRING(36),
      allowNull: true,
      unique: true,
      comment: '微信unionid'
    },
    Valid: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
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
    tableName: 'member',
    timestamps: false
  });

  Model.associate = function() {

  }

  return Model;
};
