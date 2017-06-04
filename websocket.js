const Utilites = require('./utilites');
const Querys = require('./querys');
const SocketServer = new require('ws').Server;

class WMWebSocket {

    constructor() {
        this.guid = '';
        this.socket = null;
        this.checkSession = false; /*признак авторизации*/
        this.session = '';         /*ключ авторизации*/
    };

    open(port) {
        this.socket = new SocketServer({port: port});
        this.socket.guid = this.guid;
        this.socket.on('connection', function(ws) {
            Utilites.console([0,this.guid,'client connected','','']);
            Querys.setSessionSocket(this.guid);
            ws.guid = this.guid;
            ws.timerChekAuth = setTimeout(function() { /*таймер ожидания данных авторизации*/
                Utilites.console([0,this.guid,'client timeout auth','','']);
                ws.send('AUTH|[{"session" : "давай досвидания"}]');
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
        let data,s;
        if(cmd.length>1) {
            try {
                data = JSON.parse(cmd[1]);
            } catch(e) { }
        }
        if(!this.checkSession) { /*контроль прохождения авторизации*/

            switch(cmd[0]) {
                case 'AUTH': /*авторизация клиента*/
                    if (this.session == data[0].password) {
                        this.checkSession = true;
                        Utilites.console([1, this.guid, 'client auth', '', 'OK']);
                        model.ListSockets[this.guid].server.sendsession(ws);
                    } else {
                        this.checkSession = false;
                        s = 'Давай, досвидания';
                        ws.send('AUTH|[{"session" : "'+s+'"}]');
                        Utilites.console([1, this.guid, 'client auth', '', 'ERROR']);
                        ws.close();
                    }
                    break;
                default:
                    this.checkSession = false;
                    s = 'Давай, досвидания';
                    ws.send('AUTH|[{"session" : "'+s+'"}]');
                    Utilites.console([1, this.guid, 'client auth', '', 'ERROR']);
                    ws.close();
                    break;
            }

        } else {


        }
    };

    sendsession(ws) { /*генерация сессии и отправка клиенту*/
        let s = Utilites.newsession(Utilites.datetime());
        let record= { socket: this.guid, session: s };
        Querys.addSessionSocket(record);
        ws.send('SESSION|[{"session" : "'+s+'}"]');
        Utilites.console([1, this.guid, 'SESSION', '->', '[' + s + ']']);
    };

}

module.exports = WMWebSocket;