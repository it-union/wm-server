function WM_Socket()  {

    this.guid = '';
    this.id = 0;
    this.ip = '';
    this.port = 0;
    this.active = 0;
    this.type = '';
    this.server = null;
    this.started = 0;
    this.countclients = 0;

    this.oncreate = function(item) {
        this.id = item.id;
        this.guid = item.guid;
        this.ip = item.ip;
        this.port = item.port;
        this.type = item.typ;
        this.active = item.activ;
    };
}

module.exports = WM_Socket;
