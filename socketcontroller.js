const WMSystemSocket = require('./systemsocket');
const WMWebSocket = require('./websocket');
const WMUniLinkSocket = require('./unilinksocket');

exports.StartSockets = function() {

      let k = 0;
      for(let i in model.ListSockets) {
          if(model.ListSockets[i].active > 0) {  /*запуск сокетов*/
              switch(model.ListSockets[i].type) {
                  case 'system':
                      var as = new WMSystemSocket();
                      as.guid = model.ListSockets[i].guid;
                      model.ListSockets[i].server = as;
                      as.open(model.ListSockets[i].port);
                      k = 1;
                      break;
                  case 'unilink':
                      var as = new WMUniLinkSocket();
                      as.guid = model.ListSockets[i].guid;
                      model.ListSockets[i].server = as;
                      as.open(model.ListSockets[i].ip,model.ListSockets[i].port);
                      break;
                  case 'web':
                      var as = new WMWebSocket();
                      as.guid = model.ListSockets[i].guid;
                      model.ListSockets[i].server = as;
                      as.open(model.ListSockets[i].port);
                      break;
              }
          }
      }
      if(k<1) { process.exit(-1); } /*нет системного сокета или неактивен*/

}
