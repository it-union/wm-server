
function WM_Device()  {

    this.id = 0;
    this.fnumber = '';
    this.status = 0;
    this.active = 0;
    this.ws = null;
    this.testgroup = '';
    this.testregister = '';
    this.netaddr = '';
    this.volumeGSM = 0;
    this.socketowner = ''; /* имя сокета через который присоеденился объект*/
    this.timeconnected = 0;
    this.timestatus = 0;

    this.oncreate = function(item) {
        this.id = item.id;
        this.fnumber = item.fnumber;
        this.status = 0;
        this.active = item.active;
        this.testgroup = item.testgroup;
        this.testregister = item.testregister;
        this.netaddr = item.netaddr.toString(16);
        this.volumeGSM = 0;
    };

    this.onstatus = function(status) {
        this.status = status;
    }

}

module.exports = WM_Device;