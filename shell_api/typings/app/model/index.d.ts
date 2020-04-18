// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportMember = require('../../../app/model/member');
import ExportSysUser = require('../../../app/model/sys_user');

declare module 'egg' {
  interface IModel {
    Member: ReturnType<typeof ExportMember>;
    SysUser: ReturnType<typeof ExportSysUser>;
  }
}
