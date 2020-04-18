// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportCodeUserService = require('../../../app/middleware/code_user_service');
import ExportErrorHandler = require('../../../app/middleware/error_handler');
import ExportRobot = require('../../../app/middleware/robot');
import ExportToolUtils = require('../../../app/middleware/tool_utils');
import ExportUserService = require('../../../app/middleware/user_service');
import ExportXmlparse = require('../../../app/middleware/xmlparse');
import ExportXtplExtend = require('../../../app/middleware/xtpl_extend');

declare module 'egg' {
  interface IMiddleware {
    codeUserService: typeof ExportCodeUserService;
    errorHandler: typeof ExportErrorHandler;
    robot: typeof ExportRobot;
    toolUtils: typeof ExportToolUtils;
    userService: typeof ExportUserService;
    xmlparse: typeof ExportXmlparse;
    xtplExtend: typeof ExportXtplExtend;
  }
}
