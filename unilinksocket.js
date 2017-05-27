
function WM_UniLinkSocket() {

    this.guid = '';

    this.open = function(ip,port) {

        var tcpserver = new require('net');
        tcpserver.guid = this.guid;
        tcpserver.createServer(function(sock) {
            sock.resivedata = [];
            sock.device = '';
            sock.timerChekConnection = null;
            sock.timerWaitResponse = null;
            model.Utilites.console([0,tcpserver.guid,'client connected','','']);
            model.ListSockets[tcpserver.guid].countclients = this._connections;
            sock.timerChekConnection = setTimeout(function() { /*таймер ожидания данных авторизации*/
                sock.destroy();
            }, 10000);

            sock.on('data', function(data) {
                model.Utilites.console([1,tcpserver.guid,'['+sock.device+']','<-',model.Utilites.arrayHexToString(model.Utilites.arrayDecToHex(data))]);
                model.ListSockets[tcpserver.guid].server.work(sock,data);
            });

            sock.on('close', function() {
                model.Utilites.console([0,tcpserver.guid,'client disconnected','['+sock.device+']','']);
                model.ListSockets[tcpserver.guid].server.checkSession = false;
                model.ListSockets[tcpserver.guid].countclients = this._connections;
                if(sock.device.length>0) {
                    model.ListDevices[sock.device].volumeGSM = 0;
                    model.ListDevices[sock.device].status = 0;
                    model.ListDevices[sock.device].owner = '';
                    model.ListDevices[sock.device].timestatus = model.Utilites.datetime();
                }
                model.ListSockets[tcpserver.guid].server.alertclients('STATUSDEVICES',sock);
            });

            sock.on('error', function() {
                model.Utilites.console([0,tcpserver.guid,'client error','['+sock.device+']','']);
                model.ListSockets[tcpserver.guid].server.checkSession = false;
                if(sock.device.length>0) {
                    model.ListDevices[sock.device].volumeGSM = 0;
                    model.ListDevices[sock.device].status = 0;
                    model.ListDevices[sock.device].owner = '';
                    model.ListDevices[sock.device].timestatus = model.Utilites.datetime();
                    model.ListSockets[tcpserver.guid].server.alertclients('STATUSDEVICES', sock);
                }
            });

        }).listen(port, ip);

        model.ListSockets[this.guid].started = 1;
        model.Utilites.console([0,this.guid,'server satrted','','']);

    };

    this.work = function (sock,data) {
        clearTimeout(sock.timerChekConnection);
        clearTimeout(sock.timerWaitResponse);
        sock.resivedata = model.Utilites.arrayDecToHex(data);
        var res;
        if(sock.device.length>0) { /*существующее подключение*/
            res = model.UniProto.parser(sock.resivedata);
            if(res[0]<1) { /*нет ошибок*/

                if(res[11] == '010') { /*тест канала пакет с заводским номером [регистр 0010]*/
                    var pk = model.UniProto.testdata(model.ListDevices[sock.device]);
                    model.ListSockets[this.guid].server.senddata(sock,pk,20,0);
                    model.ListDevices[sock.device].status = 2;
                    model.ListDevices[sock.device].timestatus = model.Utilites.datetime();
                    model.ListSockets[this.guid].server.alertclients('STATUSDEVICES',sock);
                } else {
                    if(res[11] == '8C8') {  /*ответ на тест канала связи [регистр 08С8]*/
                        model.ListDevices[sock.device].volumeGSM = model.Utilites.hex_to_ascii(res[13]);
                        model.ListDevices[sock.device].status = 1;
                        model.ListDevices[sock.device].timestatus = model.Utilites.datetime();
                        model.ListSockets[this.guid].server.alertclients('STATUSDEVICES',sock);
                    } else {

                    }
                }

            } else {
                sock.destroy(); /*ошибка в данных*/
            }
        } else {                 /*новое подключение*/
            res = model.UniProto.parser(sock.resivedata);
            if(res[0]<1) { /*нет ошибок*/
              var fn = model.Utilites.hex_to_ascii(res[13]);
              if(model.ListDevices[fn].active>0) {
                  sock.device = fn;
                  model.ListDevices[fn].sock = sock;
                  model.ListDevices[fn].socketowner = this.guid;
                  model.ListDevices[fn].timestatus = model.Utilites.datetime();
                  var pk = model.UniProto.testdata(model.ListDevices[fn]);
                  model.ListSockets[this.guid].server.senddata(sock,pk,20,0);
                  model.Utilites.console([1,this.guid,'['+sock.device+']','->',pk.toUpperCase()]);
              } else {
                  sock.destroy(); /*доступ запрещен*/
              }
            } else {
                sock.destroy(); /*ошибка в данных*/
            }
        }
    };

    this.senddata = function(sock,data,second,resultevent) {
        sock.write(model.UniProto.setsendbuffer(data));

        sock.timerWaitResponse = setTimeout(function() { /*таймер ожидания ответа*/
            if(resultevent<1) { sock.destroy(); }
        }, (second*1000));
    };

    this.alertclients = function(type,sock) { /*рассылка сообщений вторичным сокетам*/
        switch(type) {
            case 'STATUSDEVICES':
                var s = JSON.stringify(model.ListDevices[sock.device],["id","fnumber","status","socketowner","volumeGSM","timestatus"]);
                s = 'STATUSDEVICES|[' + s + ']';
                for (var i in model.ListSockets) {
                    if (model.ListSockets[i].guid != this.guid && sock.device!= undefined && sock.device != '') {
                        model.ListSockets[i].server.socket.clients.forEach (function (ws) {
                            ws.send(s);
                            model.Utilites.console([1,model.ListSockets[i].guid,'['+sock.device+']','->', 'GSM:' + model.ListDevices[sock.device].volumeGSM]);
                        });
                    }
                }
             break;
        }
    }

}

module.exports = WM_UniLinkSocket;