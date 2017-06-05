const DataBase = require('./db').query;
const WMDevices = require('./device');
const WMSockets = require('./sockets');

const Querys = {

    start: function(callback) {   /*старт сервера*/
        DataBase('SELECT * FROM settings', []).then(function (res) {
            res.forEach(function (item, i, res) {
                model.ListSettings[item.name] = item.value;
            });
            return DataBase('SELECT * FROM sockets', []);
        }).then(function (res) {
            res.forEach(function (item, i, res) {
                let sk = new WMSockets();
                sk.oncreate(item);
                model.ListSockets[item.guid] = sk;
            });
            return DataBase('SELECT * FROM devices', []);
        }).then(function (res) {
            res.forEach(function (item, i, res) {
                let dv = new WMDevices;
                dv.oncreate(item);
                model.ListDevices[item.fnumber] = dv;
            });
            callback(1);
        });
    },

    setSessionUser : function(ws) { /*запрос ключа авторизации*/
        DataBase('SELECT * FROM user_session', []).then(function (res) {
            res.forEach(function (item, i, res) {
                ws.session = item.session;
            });
        })
    },

    setSessionSocket : function(ws,guid) { /*запрос ключа авторизации*/
        DataBase('SELECT * FROM sockets WHERE guid=?', [guid]).then(function (res) {
            res.forEach(function (item, i, res) {
                ws.session = item.session;
            });
        })
    },

    addSessionSocket : function(record) { /*запись сесиии авторизовавшегося сокета*/
        DataBase('INSERT INTO seckets_session SET ?', [record]).then(function (res) {

        })
    }

};

module.exports = Querys;
