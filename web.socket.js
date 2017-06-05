const Utilites = require('./utilites');
const Querys = require('./querys');
const SocketServer = new require('ws').Server;

class WMWebSocket {

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
            ws.timerChekAuth = setTimeout(function() { /*таймер ожидания данных авторизации*/
                Utilites.console([0,this.guid,'client timeout auth','','']);
                ws.close();
            }, 10000);

            ws.on('close', function() {
                Utilites.console([0,this.guid,'client disconnected','','']);
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
        let s;
        try {
            data = JSON.parse(cmd[1]);

            if(!ws.oksession) { /*контроль прохождения авторизации*/
                switch(cmd[0]) {
                    case 'AUTH': /*авторизация клиента*/
                        Querys.addSessionSocket(this.guid, data.password,(res) => {  /*генерация сессии и отправка клиенту*/
                            if(res!='') {
                                ws.oksession = true;
                                Utilites.console([1, this.guid, 'client auth', '', 'OK']);
                                ws.send('SESSION|[{"session" : "'+res+'"}]');
                                Utilites.console([1, this.guid, 'SESSION', '->', '[' + res + ']']);
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


            }

        } catch(e) {
            ws.send('ERROR|[{"result" : "data format error"}]');
        }

    };

}

module.exports = WMWebSocket;