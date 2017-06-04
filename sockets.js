class WMSocket  {

    constructor() {
        this.guid = '';
        this.id = 0;
        this.ip = '';
        this.port = 0;
        this.active = 0;
        this.type = '';
        this.password = '';
        this.server = null;
        this.started = 0;
        this.countclients = 0;
    };

    oncreate(item) {
        this.id = item.id;
        this.guid = item.guid;
        this.ip = item.ip;
        this.port = item.port;
        this.type = item.typ;
        this.active = item.activ;
        this.password = item.password;
    };

}

module.exports = WMSocket;
