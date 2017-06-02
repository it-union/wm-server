
function WM_SystemSocket() {

    this.guid = '';
    this.checkSession = false; /*признак авторизации*/
    this.session = '';         /*ключ авторизации*/
    this.socket = null;


    this.open = function(port) {

        var socketserver = new require('ws').Server;
        this.socket = new socketserver({port: port});
        this.socket.guid = this.guid;
        this.socket.on('connection', function(ws) {
            model.Utilites.console([0,this.guid,'client connected','','']);
            model.Querys.setSession(this.guid);
            model.ListSockets[this.guid].countclients = this.clients.size;
            ws.guid = this.guid;
            ws.on('close', function() {
                model.Utilites.console([0,this.guid,'client disconnected','','']);
                model.ListSockets[this.guid].server.checkSession = false;
                model.ListSockets[this.guid].countclients = model.ListSockets[this.guid].server.socket.clients.size;
            });
            ws.on('message', function(message) {
                model.Utilites.console([1,this.guid,'','<-',message]);
                model.ListSockets[this.guid].server.work(ws,message);
            });
            ws.on('error', function(event) {
                model.Utilites.console([0,this.guid,'connection error','',event.data]);
            });
        });

        model.ListSockets[this.guid].started = 1;
        model.Utilites.console([0,this.guid,'server started','','']);
    };

    this.work = function (ws,message) {
        var cmd = message.split('|');
        var data = JSON.parse(cmd[1]);
        if(!this.checkSession) { /*контроль прохождения авторизации*/

            switch(cmd[0]) {
                case 'AUTH': /*авторизация клиента*/
                    if (this.session == data[0].session) {
                        this.checkSession = true;
                        model.Utilites.console([1, this.guid, 'client auth', '', 'OK']);
                    } else {
                        this.checkSession = false;
                        model.Utilites.console([1, this.guid, 'client auth', '', 'ERROR']);
                        ws.close();
                    }
                break;
                default:
                    this.checkSession = false;
                    model.Utilites.console([1, this.guid, 'client auth', '', 'ERROR']);
                    ws.close();
                break;
            }

        } else {

            switch (cmd[0]) {
                case 'SHUTDOWN':
                    process.exit(-1);
                    break;
                case 'STATUSDEVICES': /*запрос списка статусов приборов связи*/
                    var s = '';
                    var j = 0;
                    for (var i in model.ListDevices) {
                        if (s.length > 0) {
                            s += ',';
                        }
                        s += JSON.stringify(model.ListDevices[i], ["id", "fnumber", "status", "socketowner"]);
                        j++;
                    }
                    s = 'STATUSDEVICES|[' + s + ']';
                    ws.send(s);
                    model.Utilites.console([1, this.guid, 'STATUSDEVICES', '->', '[' + j + ']']);
                    break;
                case 'TESTDEVICE' :
                    if (model.ListDevices[data[0].fnumber].id != undefined && model.ListDevices[data[0].fnumber].active > 0) {
                        var pk = model.UniProto.testdata(model.ListDevices[data[0].fnumber]);
                        model.ListSockets[data[0].socketowner].server.senddata(model.ListDevices[data[0].fnumber].sock, pk, data[0].timeout, 0);
                        model.Utilites.console([1, data[0].fnumber, '[' + data[0].socketowner + ']', '->', pk.toUpperCase()]);
                        model.ListDevices[data[0].fnumber].status = 2;
                        model.ListSockets[data[0].socketowner].server.alertclients('STATUSDEVICES', model.ListDevices[data[0].fnumber].sock);
                    }
                    break;
                case 'CLOSEDEVICE': /*закрытие соединения с клиентом*/
                    if (model.ListDevices[data[0].fnumber].id != undefined && model.ListDevices[data[0].fnumber].active > 0) {
                        model.ListDevices[data[0].fnumber].sock.destroy();
                    }
                    break;
                case 'STATUSSOCKETS':
                    var s = '';
                    var j = 0;
                    for (var i in model.ListSockets) {
                        if (s.length > 0) {
                            s += ',';
                        }
                        s += JSON.stringify(model.ListSockets[i], ["id", "guid", "type", "ip", "port", "active", "started", "countclients"]);
                        j++;
                    }
                    s = 'STATUSSOCKETS|[' + s + ']';
                    ws.send(s);
                    model.Utilites.console([1, this.guid, 'STATUSSOCKETS', '->', '[' + j + ']']);
                    break;
            }

        }
    }

}

module.exports = WM_SystemSocket;