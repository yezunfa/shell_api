// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAssist = require('../../../app/controller/assist');
import ExportCoach = require('../../../app/controller/coach');
import ExportCode = require('../../../app/controller/code');
import ExportCoupon = require('../../../app/controller/coupon');
import ExportCourse = require('../../../app/controller/course');
import ExportFaceDevice = require('../../../app/controller/faceDevice');
import ExportFaceDeviceTest = require('../../../app/controller/faceDeviceTest');
import ExportGeographic = require('../../../app/controller/geographic');
import ExportHome = require('../../../app/controller/home');
import ExportLogin = require('../../../app/controller/login');
import ExportMadingyuHome = require('../../../app/controller/madingyu_home');
import ExportMigrate = require('../../../app/controller/migrate');
import ExportOrder = require('../../../app/controller/order');
import ExportPayment = require('../../../app/controller/payment');
import ExportPlaceOrder = require('../../../app/controller/place_order');
import ExportSpa = require('../../../app/controller/spa');
import ExportSystem = require('../../../app/controller/system');
import ExportTest = require('../../../app/controller/test');
import ExportTools = require('../../../app/controller/tools');
import ExportUpload = require('../../../app/controller/upload');
import ExportUser = require('../../../app/controller/user');
import ExportVerification = require('../../../app/controller/verification');
import ExportWechat = require('../../../app/controller/wechat');
import ExportWxpay = require('../../../app/controller/wxpay');
import ExportShellCart = require('../../../app/controller/shell/cart');
import ExportShellMember = require('../../../app/controller/shell/member');
import ExportShellOrder = require('../../../app/controller/shell/order');
import ExportShellPayment = require('../../../app/controller/shell/payment');
import ExportShellProduct = require('../../../app/controller/shell/product');

declare module 'egg' {
  interface IController {
    assist: ExportAssist;
    coach: ExportCoach;
    code: ExportCode;
    coupon: ExportCoupon;
    course: ExportCourse;
    faceDevice: ExportFaceDevice;
    faceDeviceTest: ExportFaceDeviceTest;
    geographic: ExportGeographic;
    home: ExportHome;
    login: ExportLogin;
    madingyuHome: ExportMadingyuHome;
    migrate: ExportMigrate;
    order: ExportOrder;
    payment: ExportPayment;
    placeOrder: ExportPlaceOrder;
    spa: ExportSpa;
    system: ExportSystem;
    test: ExportTest;
    tools: ExportTools;
    upload: ExportUpload;
    user: ExportUser;
    verification: ExportVerification;
    wechat: ExportWechat;
    wxpay: ExportWxpay;
    shell: {
      cart: ExportShellCart;
      member: ExportShellMember;
      order: ExportShellOrder;
      payment: ExportShellPayment;
      product: ExportShellProduct;
    }
  }
}
