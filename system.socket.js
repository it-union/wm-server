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
            ws.devices = [];      /*список device принадлежащих клиенту*/
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
        let data,mass;

        try {
            data = JSON.parse(message);
            if(!ws.oksession) { /*контроль прохождения авторизации*/
                switch(data.command) {
                    case 'AUTH': /*авторизация клиента*/
                        Querys.setSessionUser(data.session,(res) => {  /*проверка сессии клиента*/
                            if(res) {
                                ws.oksession = true;
                                Utilites.console([1, this.guid, 'client auth', '', 'OK']);
                            } else {  /*ошибка авторизации*/
                                ws.oksession = false;
                                Utilites.console([1, this.guid, 'client auth', '', 'ERROR']);
                                ws.send('{"command": "AUTH", "result" : "access denied"}');
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

                switch (data.command) {
                    case 'SHUTDOWN':
                        process.exit(-1);
                        break;
                    case 'STATUSDEVICES': /*запрос списка статусов приборов связи*/
                        s = '';
                        j = 0;
                        for (let i in model.ListDevices) {
                            if (s.length > 0) { s += ','; }
                            if(Utilites.findElement(ws.devices,model.ListDevices[i].fnumber)) {
                                s += JSON.stringify(model.ListDevices[i], ["id", "fnumber", "status", "socketowner"]);
                                j++;
                            }
                        }
                        s = '{ "command" : "STATUSDEVICES", "items" : [' + s + ']}';
                        ws.send(s);
                        Utilites.console([1, this.guid, 'STATUSDEVICES', '->', '[' + j + ']']);
                        break;
                    case 'TESTDEVICE' :
                        if (model.ListDevices[data.fnumber].id != undefined && model.ListDevices[data.fnumber].active > 0) {
                            let pk = UniProto.testdata(model.ListDevices[data.fnumber]);
                            model.ListSockets[data.socketowner].server.senddata(model.ListDevices[data.fnumber].sock, pk, data.timeout, 0);
                            Utilites.console([1, data.socketowner, '[' + data.fnumber + ']', '->', pk.toUpperCase()]);
                            model.ListDevices[data.fnumber].status = 2;
                            model.ListSockets[data.socketowner].server.alertclients('STATUSDEVICES', model.ListDevices[data.fnumber].sock);
                        }
                        break;
                    case 'CLOSEDEVICE': /*закрытие соединения с клиентом*/
                        if (model.ListDevices[data.fnumber].id != undefined && model.ListDevices[data.fnumber].active > 0) {
                            model.ListDevices[data.fnumber].sock.destroy();
                            ws.send('{"command" : "CLOSEDEVICE", "result" : "OK"}');
                        }
                        break;
                    case 'STATUSSOCKETS':
                        s = '';
                        j = 0;
                        for (let i in model.ListSockets) {
                            if (s.length > 0) { s += ','; }
                            s += JSON.stringify(model.ListSockets[i], ["id", "guid", "type", "ip", "port", "active", "started", "countclients"]);
                            j++;
                        }
                        s = '{"command" : "STATUSSOCKETS", "items" : [' + s + ']}';
                        ws.send(s);
                        Utilites.console([1, this.guid, 'STATUSSOCKETS', '->', '[' + j + ']']);
                        break;
                    case 'MYDEVICES':
                        ws.length = 0;
                        mass = data.items;
                        mass.forEach(function(item, i, mass) {
                            ws.devices.push(item.fnumber);
                        });
                        ws.send('{"command" : "MYDEVICES", "result" : "OK"}');
                        break;
                }

            }

        } catch(e) {
            ws.send('{"command": "'+data.command+'", "result" : "data format error"}');
        }


    }

}

module.exports = WMSystemSocket;