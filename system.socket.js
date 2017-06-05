const Utilites = require('./utilites');
const UniProto = require('./uniproto');
const SocketServer = new require('ws').Server;
const Querys = require('./querys');

class WMSystemSocket {

    constructor() {
        this.guid = '';
        this.socket = null;
    };

    open(port) {
        this.socket = new SocketServer({port: port});
        this.socket.guid = this.guid;
        this.socket.on('connection', function(ws) {

            Utilites.console([0,this.guid,'client connected','','']);
            ws.guid = this.guid;
            ws.session = '';
            ws.oksession = false; /*признак авторизации*/
            model.ListSockets[this.guid].countclients = this.clients.size;

            ws.timerChekAuth = setTimeout(function() { /*таймер ожидания данных авторизации*/
                Utilites.console([0,this.guid,'client timeout auth','','']);
                ws.close();
            }, 10000);

            ws.on('close', function() {
                Utilites.console([0,this.guid,'client disconnected','','']);
                model.ListSockets[this.guid].countclients = model.ListSockets[this.guid].server.socket.clients.size;
            });

            ws.on('message', function(message) {
                Utilites.console([1,this.guid,'','<-',message]);
                model.ListSockets[this.guid].server.work(ws,message);
            });

            ws.on('error', function(event) {
                Utilites.console([0,this.guid,'connection error','',event.data]);
            });

        });

        model.ListSockets[this.guid].started = 1;
        Utilites.console([0,this.guid,'server started','','']);
    };

    work(ws,message) {
        clearTimeout(ws.timerChekAuth);
        let cmd = message.split('|');
        let data;

        try {
            data = JSON.parse(cmd[1]);
            if(!ws.oksession) { /*контроль прохождения авторизации*/
                switch(cmd[0]) {
                    case 'AUTH': /*авторизация клиента*/
                        Querys.setSessionUser(data[0].session,(res) => {  /*проверка сессии клиента*/
                            if(res) {
                                ws.oksession = true;
                                Utilites.console([1, this.guid, 'client auth', '', 'OK']);
                            } else {  /*ошибка авторизации*/
                                ws.oksession = false;
                                Utilites.console([1, this.guid, 'client auth', '', 'ERROR']);
                                ws.send('AUTH|[{"result" : "access denied"}]');
                                ws.close();
                            }
                        });
                        break;
                    default:
                        ws.oksession = false;
                        Utilites.console([1, this.guid, 'client auth', '', 'ERROR']);
                        ws.close();
                        break;
                }
            } else {

                let s,j;

                switch (cmd[0]) {
                    case 'SHUTDOWN':
                        process.exit(-1);
                        break;
                    case 'STATUSDEVICES': /*запрос списка статусов приборов связи*/
                        s = '';
                        j = 0;
                        for (let i in model.ListDevices) {
                            if (s.length > 0) {
                                s += ',';
                            }
                            s += JSON.stringify(model.ListDevices[i], ["id", "fnumber", "status", "socketowner"]);
                            j++;
                        }
                        s = 'STATUSDEVICES|[' + s + ']';
                        ws.send(s);
                        Utilites.console([1, this.guid, 'STATUSDEVICES', '->', '[' + j + ']']);
                        break;
                    case 'TESTDEVICE' :
                        if (model.ListDevices[data[0].fnumber].id != undefined && model.ListDevices[data[0].fnumber].active > 0) {
                            let pk = UniProto.testdata(model.ListDevices[data[0].fnumber]);
                            model.ListSockets[data[0].socketowner].server.senddata(model.ListDevices[data[0].fnumber].sock, pk, data[0].timeout, 0);
                            Utilites.console([1, data[0].socketowner, '[' + data[0].fnumber + ']', '->', pk.toUpperCase()]);
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
                        s = '';
                        j = 0;
                        for (let i in model.ListSockets) {
                            if (s.length > 0) {
                                s += ',';
                            }
                            s += JSON.stringify(model.ListSockets[i], ["id", "guid", "type", "ip", "port", "active", "started", "countclients"]);
                            j++;
                        }
                        s = 'STATUSSOCKETS|[' + s + ']';
                        ws.send(s);
                        Utilites.console([1, this.guid, 'STATUSSOCKETS', '->', '[' + j + ']']);
                        break;
                }

            }

        } catch(e) {


        }


    }

}

module.exports = WMSystemSocket;