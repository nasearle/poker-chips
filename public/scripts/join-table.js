const playerName = document.querySelector('#name');
const tableId = document.querySelector('#id');
const formCreateTable = document.querySelector('#formCreateTable');
const formJoinTable = document.querySelector('#formJoinTable');

formJoinTable.onsubmit = event => {
  event.preventDefault();
  if (chatInput.value[0] === '/') {
    socket.emit('evalServer', chatInput.value.slice(1));
  } else {
    socket.emit('sendMsgToServer', chatInput.value);
  }
  chatInput.value = '';
};
