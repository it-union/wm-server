
var DB_Querys = {

    start: function() {   /*старт сервера*/
        model.DataBase('SELECT * FROM settings', []).then(function (res) {
            res.forEach(function (item, i, res) {
                model.ListSettings[item.name] = item.value;
            });
            return model.DataBase('SELECT * FROM sockets', []);
        }).then(function (res) {
            res.forEach(function (item, i, res) {
                var sk = new model.Sockets();
                sk.oncreate(item);
                model.ListSockets[item.guid] = sk;
            });
            return model.DataBase('SELECT * FROM devices', []);
        }).then(function (res) {
            res.forEach(function (item, i, res) {
                var dv = new model.Devices();
                dv.oncreate(item);
                model.ListDevices[item.fnumber] = dv;
            });
            var k = 0;
            for(var i in model.ListSockets) {
                if(model.ListSockets[i].active > 0) {  /*запуск сокетов*/
                    switch(model.ListSockets[i].type) {
                        case 'system':
                            var as = new model.SystemSocket();
                            as.guid = model.ListSockets[i].guid;
                            model.ListSockets[i].server = as;
                            as.open(model.ListSockets[i].port);
                            k = 1;
                            break;
                        case 'unilink':
                            var as = new model.UniLinkSocket();
                            as.guid = model.ListSockets[i].guid;
                            model.ListSockets[i].server = as;
                            as.open(model.ListSockets[i].ip,model.ListSockets[i].port);
                            break;
                        case 'web':
                            var as = new model.WebSocket();
                            as.guid = model.ListSockets[i].guid;
                            model.ListSockets[i].server = as;
                            as.open(model.ListSockets[i].port);
                            break;
                    }
                }
            }
            if(k<1) { process.exit(-1); } /*нет системного сокета или неактивен*/
        });
    },

    setSession : function(guid) { /*запрос ключа авторизации*/
        model.DataBase('SELECT * FROM user_session', []).then(function (res) {
            res.forEach(function (item, i, res) {
                model.ListSockets[guid].server.session = item.session;
            });
        })
    }

};

module.exports = DB_Querys;
