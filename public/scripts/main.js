const socket= io();

const tempCreateTable = document.querySelector('#tempCreateTable');

const btnCreate = document.querySelector('#btnCreate');
const btnJoin = document.querySelector('#btnJoin');

btnCreate.onclick = () => {
  const playerName = document.querySelector('#nameCreate').value;
  const tableBuyIn = document.querySelector('#buyIn').value;
  socket.emit('createTable', { playerName: playerName, tableBuyIn: tableBuyIn });
};

btnJoin.onclick = () => {
  const playerName = document.querySelector('#nameJoin').value;
  const tableId = document.querySelector('#id').value;
  socket.emit('joinTable', { playerName: playerName, tableId: tableId });
};

socket.on('joinedTable', data => {
  const tableId = data.tableId;
  const playerName = data.playerName;
  const tableBuyIn = data.tableBuyIn;
  console.log(tableId);
  console.log(playerName);
  console.log(tableBuyIn);
});

socket.on('tableNews', data => {
  console.log(data);
});
