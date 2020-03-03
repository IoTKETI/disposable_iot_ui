"use strict";

var __SOCKET_IO__ = null;
var clientType = null;
var clientList = new Map();


// manager로부터 전달되는 notification을 전달받기 위한 client를 설정하는 외부함수
function _initSocket(io) {
  var aename;
  __SOCKET_IO__ = io;
  io.on('connection', function (socket) {
    // Gcs 유저 용 Connect, AE에 따른 구분이 없다.
    socket.on('gcs:connect', _ => {
      socket.join('gcs', () => {
        console.log(`GCS ${socket.id} connected`);
      })
      clientList.set(socket.id, 'gcs');
      clientType = 'gcs';
    });
    // Pilot 유저 용 Connect, AE별로 Room을 구성
    socket.on('pilot:connect', aename => {
      if (!aename) {
        console.error('invalid aename when try connect socket');
        return;
      }
      socket.join(aename, () => {
        console.log(`${socket.id} joined rooms ${JSON.stringify(socket.rooms)}`);
      });
      clientList.set(socket.id, aename);
      clientType = 'pilot'
      // Broadcast? or by selected AE
    })
    socket.on('disconnect', () => {
      socket.leave(aename);
      clientList.forEach((v, k) => {
        if (v == socket.id) {
          clientList.delete(k);
          LOGGER.info(`${k} disconnect`);
        }
      })
    })
  });
}


// manager로부터 전달되는 notification을 client로 전달하는 외부함수
function _pushNotification(event, target, data) {
  __SOCKET_IO__.sockets.in(target).emit(event, data);
  __SOCKET_IO__.sockets.in('gcs').emit(event, data);
}


function _broadcast(event, data){
  __SOCKET_IO__.sockets.emit(event, data);
}


module.exports.initSocket = _initSocket;
module.exports.pushNotification = _pushNotification;
module.exports.broadcast = _broadcast;
