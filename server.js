//const http = require('http');
//const Static = require('node-static');

const DataBase = require('./db').query;
const Querys = require('./querys');
const SocketController = require('./socketcontroller');

let ListSockets = []; /*массив сокетов*/
let ListDevices = []; /*список приборов связи*/
let ListSettings = []; /*настройки сервера*/

/*глобальные ссылки на объекты*/
global.model = {
    ListDevices : ListDevices,
    ListSockets : ListSockets,
    ListSettings : ListSettings
};
/*------------------------------*/

Querys.start((res) => { 
    if(res>0) {
        SocketController.StartSockets();
    }
}); /**/









