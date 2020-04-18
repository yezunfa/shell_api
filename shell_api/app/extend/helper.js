'use strict';
const moment = require('moment');
module.exports = {
    getCDNHost() {
        const cdnHost = this.app.config.cdnHost;
        if (this.app.config.isProd) {
            return cdnHost.online;
        }
        return cdnHost.daily;
    },
    relativeTime(time){
        return moment(new Date(time)).fromNow()
    }

}