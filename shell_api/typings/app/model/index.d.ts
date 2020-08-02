// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportBanner = require('../../../app/model/banner');
import ExportCart = require('../../../app/model/cart');
import ExportMember = require('../../../app/model/member');
import ExportOrderMain = require('../../../app/model/order_main');
import ExportOrderPayment = require('../../../app/model/order_payment');
import ExportOrderRefund = require('../../../app/model/order_refund');
import ExportOrderSub = require('../../../app/model/order_sub');
import ExportProduct = require('../../../app/model/product');
import ExportProductType = require('../../../app/model/product_type');
import ExportSysCache = require('../../../app/model/sys_cache');
import ExportSysUser = require('../../../app/model/sys_user');

declare module 'egg' {
  interface IModel {
    Banner: ReturnType<typeof ExportBanner>;
    Cart: ReturnType<typeof ExportCart>;
    Member: ReturnType<typeof ExportMember>;
    OrderMain: ReturnType<typeof ExportOrderMain>;
    OrderPayment: ReturnType<typeof ExportOrderPayment>;
    OrderRefund: ReturnType<typeof ExportOrderRefund>;
    OrderSub: ReturnType<typeof ExportOrderSub>;
    Product: ReturnType<typeof ExportProduct>;
    ProductType: ReturnType<typeof ExportProductType>;
    SysCache: ReturnType<typeof ExportSysCache>;
    SysUser: ReturnType<typeof ExportSysUser>;
  }
}
