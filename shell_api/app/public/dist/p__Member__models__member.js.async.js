(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[39],{qvDI:function(e,t,n){"use strict";n.r(t);var r=n("p0pE"),a=n.n(r),c=n("d6i3"),s=n.n(c),u=n("1l/V"),p=n.n(u),i=n("Qyje"),o=n("t3Un");function l(e){return f.apply(this,arguments)}function f(){return f=p()(s.a.mark(function e(t){return s.a.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return e.abrupt("return",Object(o["a"])("/api/member",{method:"POST",body:t}));case 1:case"end":return e.stop()}},e)})),f.apply(this,arguments)}function w(){return b.apply(this,arguments)}function b(){return b=p()(s.a.mark(function e(){var t,n=arguments;return s.a.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return t=n.length>0&&void 0!==n[0]?n[0]:{},e.abrupt("return",Object(o["a"])("/api/member?".concat(Object(i["stringify"])(t))));case 2:case"end":return e.stop()}},e)})),b.apply(this,arguments)}function d(){return h.apply(this,arguments)}function h(){return h=p()(s.a.mark(function e(){return s.a.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return e.abrupt("return",Object(o["a"])("/api/belongs"));case 1:case"end":return e.stop()}},e)})),h.apply(this,arguments)}function m(){return v.apply(this,arguments)}function v(){return v=p()(s.a.mark(function e(){return s.a.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return e.abrupt("return",Object(o["a"])("/api/belongs"));case 1:case"end":return e.stop()}},e)})),v.apply(this,arguments)}t["default"]={namespace:"member",state:{belongs:[],member:{list:[],pagination:{}}},effects:{add:s.a.mark(function e(t,n){var r,a,c,u;return s.a.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return r=t.payload,a=n.call,c=n.put,e.next=4,a(l,r);case 4:u=e.sent,c({type:"saveMember",payload:u});case 6:case"end":return e.stop()}},e)}),getBelongs:s.a.mark(function e(t,n){var r,a,c,u;return s.a.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return r=t.payload,a=n.call,c=n.put,e.next=4,a(d,r);case 4:return u=e.sent,e.next=7,c({type:"saveBelongs",payload:u});case 7:case"end":return e.stop()}},e)}),getMemberList:s.a.mark(function e(t,n){var r,a,c,u,p;return s.a.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return r=t.payload,a=t.callback,c=n.call,u=n.put,e.next=4,c(w,r);case 4:return p=e.sent,e.next=7,u({type:"saveMember",payload:p});case 7:a&&a();case 8:case"end":return e.stop()}},e)}),distribution:s.a.mark(function e(t,n){var r,a,c;return s.a.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return r=t.payload,a=t.callback,c=n.call,e.next=4,c(m,r);case 4:a&&a();case 5:case"end":return e.stop()}},e)})},reducers:{saveMember:function(e,t){var n=t.payload;return a()({},e,{member:n})},saveBelongs:function(e,t){var n=t.payload;return a()({},e,{belongs:n.list})}}}}}]);