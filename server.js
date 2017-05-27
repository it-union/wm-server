var http = require('http');
var Static = require('node-static');

/*соединение с БД*/
var mysql = require('mysql');
var PoolDB  = mysql.createPool({
    host:     'localhost',
    user:     'root',
    password: '',
    database: 'wm_server'
});

var Querys = require('./querys');
var SystemSocket = require('./systemsocket');
var UniLinkSocket = require('./unilinksocket');
var WebSocket = require('./websocket');
var Devices = require('./device');
var Sockets = require('./sockets');
var Utilites = require('./utilites');
var UniProto = require('./uniproto');

var ListSockets = []; /*массив сокетов*/
var ListDevices = []; /*список приборов связи*/
var ListSettings = []; /*настройки сервера*/

/*глобальные ссылки на объекты*/
global.model = {
    PoolDB : PoolDB,
    SystemSocket : SystemSocket,
    UniLinkSocket : UniLinkSocket,
    WebSocket : WebSocket,
    Devices : Devices,
    ListDevices : ListDevices,
    ListSockets : ListSockets,
    ListSettings : ListSettings,
    Querys : Querys,
    Sockets : Sockets,
    Utilites : Utilites,
    UniProto : UniProto
};
/*------------------------------*/

Querys.loadSettings(); /*запрос списка параметров из БД*/
Querys.loadSockets(); /*запрос параметров сервера из БД*/
Querys.loadDevices(); /*запрос списка приборов связи из БД*/
/*тестовый комент*/








