
var DB_Querys = {

    loadSettings : function() {
        model.PoolDB.getConnection(function(error,conn) {
            conn.query('SELECT * FROM settings', function (error, result) {
                result.forEach(function (item, i, result) {
                        model.ListSettings[item.name] = item.value;
                });
            });
            conn.release();
        })
    },

    loadSockets : function() { /*запрос списка сокетов*/
        model.PoolDB.getConnection(function(error,conn) {
            conn.query('SELECT * FROM sockets', function (error, result) {
                result.forEach(function (item, i, result) {
                        var sk = new model.Sockets();
                        sk.oncreate(item);
                        model.ListSockets[item.guid] = sk;
                });
            });
            conn.release();
        })
    },

    loadDevices : function() { /*запрос списка приборов связи из БД*/
        model.PoolDB.getConnection(function(error,conn) {
            conn.query('SELECT * FROM devices', function (error, result) {
                result.forEach(function (item, i, result) {
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
            conn.release();
        })

    },

    setSession : function(guid) { /*запрос ключа авторизации*/
        model.PoolDB.getConnection(function(error,conn) {
            conn.query('SELECT * FROM user_session', function (error, result) {
                result.forEach(function (item, i, result) {
                    model.ListSockets[guid].server.session = item.session;
                });
            });
            conn.release();
        })
    }

};

module.exports = DB_Querys;
