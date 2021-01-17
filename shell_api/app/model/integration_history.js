'use strict';
/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('integration_history', {
    Id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      comment: '主键'
    },
    MemberId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      comment: '会员ID'
    },
    OperationType: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: '',
      comment: '积分类型'
    },
    OperationRemark: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: '',
      comment: '备注'
    },
    Integration: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '积分'
    },
    Balance: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: '剩余积分'
    },
    IsAdd: {
      type: DataTypes.INTEGER(36),
      allowNull: false,
      defaultValue: '1',
      comment: '是否增加'
    },
    State: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0',
      comment: '状态'
    },
    isGroup: {
      type: DataTypes.INTEGER(36),
      allowNull: false,
      defaultValue: '0',
      comment: '是否是团课'
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
    tableName: 'integration_history',
    timestamps: false
  });

  Model.associate = function() {

  }

  return Model;
};
