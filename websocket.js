
function WM_WebSocket() {

    this.guid = '';
    this.socket = null;
    this.checkSession = false; /*признак авторизации*/

    this.open = function(port) {

        var socketserver = new require('ws').Server;
        this.socket = new socketserver({port: port});
        this.socket.guid = this.guid;
        this.socket.on('connection', function(ws) {
            model.Utilites.console([0,this.guid,'client connected','','']);
            ws.guid = this.guid;
            ws.on('close', function() {
                model.Utilites.console([0,this.guid,'client disconnected','','']);
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
                    if (this.password == data[0].password) {
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


        }
    }

}

module.exports = WM_WebSocket;