const DataBase = require('./db').query;
const Utilites = require('./utilites');
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

    setSessionUser : function(session,callback) { /*проверка ключа авторизации*/
        DataBase('SELECT * FROM user_session', []).then(function (res) {
            let pass = false;
            res.forEach(function (item, i, res) {
                if(session == item.session) { pass = true; }
            });
            callback(pass);
        })
    },

    addSessionSocket : function(guid,password,callback) { /*запрос ключа авторизации*/
        DataBase('SELECT * FROM sockets WHERE guid=?', [guid]).then(function (res) {
            let pass = false;
            res.forEach(function (item, i, res) {
                if(password == item.password) { pass = true; }
            });

            if(pass) {
                let s = Utilites.newsession(Utilites.datetime()); /*генератор сессии MD5*/
                let record = [guid, s];
                callback(s);
                return DataBase('INSERT INTO sockets_session (socket,session) VALUES (?,?)', record);
            } else {
                callback('');  /*не совпал пароль - поэтому сессия пустая*/
            }
        }).then(function(res) {
            /*сохранение сессии  в БД*/
        })
    }


};

module.exports = Querys;
