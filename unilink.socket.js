const Utilites = require('./utilites');
const UniProto = require('./uniproto');
const Querys = require('./querys');
const TSPServer = new require('net');

class WMUniLinkSocket {

    constructor() {
        this.guid = '';
    }

    open(ip,port) {

        TSPServer.guid = this.guid;
        TSPServer.createServer(function(sock) {
            sock.resivedata = [];
            sock.device = '';
            sock.timerChekConnection = null; /*таймер ожидания авторизации*/
            sock.timerWaitResponse = null; /*таймер ожидания ответа*/
            sock.timerBackTest = null; /*таймер обратного теста*/
            Utilites.console([0,TSPServer.guid,'client connected','','']);
            model.ListSockets[TSPServer.guid].countclients = this._connections;
            sock.timerChekConnection = setTimeout(function() { /*таймер ожидания данных авторизации*/
                sock.destroy();
            }, 10000);

            sock.on('data', function(data) {
                Utilites.console([1,TSPServer.guid,'['+sock.device+']','<-',Utilites.arrayHexToString(Utilites.arrayDecToHex(data))]);
                model.ListSockets[TSPServer.guid].server.work(sock,data);
            });

            sock.on('close', function() {
                Utilites.console([0,TSPServer.guid,'client disconnected','['+sock.device+']','']);
                model.ListSockets[TSPServer.guid].countclients = this._connections;
                if(sock.device.length>0) {
                    model.ListDevices[sock.device].volumeGSM = 0;
                    model.ListDevices[sock.device].status = 0;
                    model.ListDevices[sock.device].owner = '';
                    model.ListDevices[sock.device].timestatus = Utilites.datetime();
                }
                model.ListSockets[TSPServer.guid].server.alertclients('STATUSDEVICES',sock);
            });

            sock.on('error', function() {
                Utilites.console([0,TSPServer.guid,'client error','['+sock.device+']','']);
                if(sock.device.length>0) {
                    model.ListDevices[sock.device].volumeGSM = 0;
                    model.ListDevices[sock.device].status = 0;
                    model.ListDevices[sock.device].owner = '';
                    model.ListDevices[sock.device].timestatus = Utilites.datetime();
                    model.ListSockets[TSPServer.guid].server.alertclients('STATUSDEVICES', sock);
                }
            });

        }).listen(port, ip);

        model.ListSockets[this.guid].started = 1;
        Utilites.console([0,this.guid,'server satrted','','']);

    };

    work(sock,data) {
        clearTimeout(sock.timerChekConnection);
        clearTimeout(sock.timerWaitResponse);
        clearTimeout(sock.timerBackTest);

        sock.resivedata = Utilites.arrayDecToHex(data);
        let res;
        if(sock.device.length>0) { /*существующее подключение*/

            sock.timerBackTest = setTimeout(function() { /*таймер обратного теста*/
                let pk = UniProto.testdata(model.ListDevices[sock.device]);
                model.ListSockets[TSPServer.guid].server.senddata(sock,pk,20,0);
                Utilites.console([1,TSPServer.guid,'['+sock.device+']','->',pk.toUpperCase()]);
            }, model.ListDevices[sock.device].backtest * 1000);

            res = UniProto.parser(sock.resivedata);
            if(res.result<1) { /*нет ошибок*/

                if(res._addr == '0010') { /*тест канала пакет с заводским номером [регистр 0010]*/
                    let pk = UniProto.testdata(model.ListDevices[sock.device]);
                    model.ListSockets[this.guid].server.senddata(sock,pk,20,0);
                    model.ListDevices[sock.device].status = 2;
                    model.ListDevices[sock.device].timestatus = Utilites.datetime();
                    model.ListSockets[this.guid].server.alertclients('STATUSDEVICES',sock);
                } else {
                    if(res._addr == '08C8') {  /*ответ на тест канала связи [регистр 08С8]*/
                        model.ListDevices[sock.device].volumeGSM = Utilites.hex_to_ascii(res._data);
                        model.ListDevices[sock.device].status = 1;
                        model.ListDevices[sock.device].timestatus = Utilites.datetime();
                        model.ListSockets[this.guid].server.alertclients('STATUSDEVICES',sock);
                    } else {
                      if(res.idsocket != 'FF') { /*транзит (номер сокета <255)*/
                        model.ListDevices[sock.device].status = 1;
                        model.ListDevices[sock.device].timestatus = Utilites.datetime();
                        model.ListSockets[this.guid].server.returndata(sock,res);
                        model.ListSockets[this.guid].server.alertclients('STATUSDEVICES',sock);
                      }
                    }
                }

            } else {
                sock.destroy(); /*ошибка в данных*/
            }
        } else { /*новое подключение*/
            res = UniProto.parser(sock.resivedata);
            if(res.result<1) { /*нет ошибок*/
              let fn = Utilites.hex_to_ascii(res._data);
              if(model.ListDevices[fn].active>0) {
                  sock.device = fn;
                  model.ListDevices[fn].sock = sock;
                  model.ListDevices[fn].socketowner = this.guid;
                  model.ListDevices[fn].timestatus = Utilites.datetime();
                  let pk = UniProto.testdata(model.ListDevices[fn]);
                  model.ListSockets[this.guid].server.senddata(sock,pk,20,0);
                  Utilites.console([1,this.guid,'['+sock.device+']','->',pk.toUpperCase()]);
              } else {
                  sock.destroy(); /*доступ запрещен*/
              }
            } else {
                sock.destroy(); /*ошибка в данных*/
            }
        }
    };

    senddata(sock,data,second,resultevent) {
        sock.write(UniProto.setsendbuffer(data));

        sock.timerWaitResponse = setTimeout(function() { /*таймер ожидания ответа*/
            if(resultevent<1) { sock.destroy(); }
            else {
                clearTimeout(sock.timerWaitResponse);
                model.ListSockets[TSPServer.guid].server.alertclients('STATUSDEVICES',sock);
            }
        }, (second*1000));
    };

    returndata(sock,res) {
        for (let i in model.ListSockets) {
            if (model.ListSockets[i].server.id == res.idsocket && sock.device!= undefined && sock.device != '') {
                model.ListSockets[i].server.socket.clients.forEach (function (ws) {
                    if(ws.oksession && Utilites.findElement(ws.devices,sock.device) && (ws.id == res.idclient)) {
                        model.ListDevices[sock.device].resivedata = res._data;
                        let s = JSON.stringify(model.ListDevices[sock.device],["id","fnumber","status","timestatus","resivedata"]);
                        s = '{ "command" : "TRANSIT", "items" : [' + s + ']}';
                        ws.send(s);
                        model.ListDevices[sock.device].resivedata = '';
                        Utilites.console([1, model.ListSockets[i].guid, '[' + sock.device + ']', '->', 'ResiveData: ' + res._data]);
                    }
                });
            }
        }
    };

    alertclients(type,sock) { /*рассылка сообщений вторичным сокетам*/
        switch(type) {
            case 'STATUSDEVICES':
                let s = JSON.stringify(model.ListDevices[sock.device],["id","fnumber","status","socketowner","volumeGSM","timestatus"]);
                s = '{ "command" : "STATUSDEVICES", "items" : [' + s + ']}';
                for (let i in model.ListSockets) {
                    if (model.ListSockets[i].guid != this.guid && sock.device!= undefined && sock.device != '') {
                        model.ListSockets[i].server.socket.clients.forEach (function (ws) {
                            if(ws.oksession && Utilites.findElement(ws.devices,sock.device)) {
                                ws.send(s);
                                Utilites.console([1, model.ListSockets[i].guid, '[' + sock.device + ']', '->', 'GSM:' + model.ListDevices[sock.device].volumeGSM]);
                            }
                        });
                    }
                }
             break;
        }
    }

}

module.exports = WMUniLinkSocket;