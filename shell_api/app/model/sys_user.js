'use strict';
/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('sys_user', {
    Id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      comment: '主键'
    },
    SysDepartmentId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '所属部门'
    },
    Name: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '姓名'
    },
    Email: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '邮箱'
    },
    Rank: {
      type: DataTypes.INTEGER(2),
      allowNull: true,
      comment: '职阶'
    },
    NickName: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '昵称'
    },
    State: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      defaultValue: '1',
      comment: '状态'
    },
    Position: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '职位'
    },
    Code: {
      type: DataTypes.STRING(36),
      allowNull: false,
      defaultValue: '',
      unique: true,
      comment: '员工号'
    },
    Sex: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: '保密',
      comment: '性别'
    },
    Mobile: {
      type: DataTypes.STRING(18),
      allowNull: false,
      defaultValue: '',
      comment: '电话'
    },
    ParentId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'sys_user',
        key: 'Id'
      },
      comment: '直属上司'
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
    Birthday: {
      type: DataTypes.DATE(6),
      allowNull: true,
      comment: '生日'
    },
    Introdution: {
      type: DataTypes.STRING(8000),
      allowNull: true,
      comment: '简介'
    },
    Education: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '最高学历'
    },
    Major: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '所学专业'
    },
    CertificateType: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '证件类型'
    },
    CertificateNumber: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '证件号码'
    },
    CertificatePhotoList: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      comment: '证件照片'
    },
    ExperiencePhotoList: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      comment: '资历证书'
    },
    Duration: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '从业时长'
    },
    AccountState: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      defaultValue: '0',
      comment: '账号状态'
    },
    LoginName: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '登录名'
    },
    Password: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '登录密码'
    },
    openid: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '微信小程序openid'
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
    tableName: 'sys_user',
    timestamps: false
  });

  Model.associate = function() {

  }

  return Model;
};
