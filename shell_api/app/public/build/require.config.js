requirejs.config(
{
  "baseUrl": "/assets",
  "map": {
    "*": {
      "css": "lib/css.min"
    }
  },
  "paths": {
    "zepto": "lib/zepto-1.2.0",
    "decimaljs": "lib/decimal.min",
    "moment": "lib/moment-with-locales.min",
    "xtemplate": "lib/xtemplate",
    "font/iconfont": "font/iconfont"
  }
}
);