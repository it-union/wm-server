
function WM_WebSocket() {

    this.guid = '';
    this.socket = null;

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

    }

}

module.exports = WM_WebSocket;