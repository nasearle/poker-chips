function PokerChipz() {
  const self = this;
  this.initTemplates();
  this.viewCreateTable();
  this.socket = io();

  this.socket.on('joinedTable', data => {
    // data => { tableId: tableId, playerName: playerName, tableBuyIn: buyInVal }
    const tableId = data.tableId;
    const playerName = data.playerName;
    const tableBuyIn = data.tableBuyIn;
    self.viewTable(tableId, playerName, tableBuyIn);
  });

  this.socket.on('newPlayer', data => {
    // data => { playerName: playerName, value: buyInVal }
    self.viewNewPlayer(data);
  });

  this.socket.on('currentPlayers', data => {
    // data => { player1Name: 1000, player2Name: 1000, etc.}
    self.viewPlayers(data);
  });

  this.socket.on('tableNews', data => {
    // data => message string
    self.viewTableNews(data);
  });

  this.socket.on('updatePlayer', data => {
    // data => { playerName: playerName, value: numPlayerVal }
    self.viewUpdatePlayer(data);
  });
}

PokerChipz.prototype.initTemplates = function() {
  this.templates = {};
  document.querySelectorAll('.template').forEach(el => {
    this.templates[el.getAttribute('id')] = el;
  });
};

PokerChipz.prototype.renderTemplate = function(id) {
  const template = this.templates[id];
  const el = template.cloneNode(true);
  el.removeAttribute('hidden');
  return el;
};

PokerChipz.prototype.replaceElement = function(parent, content) {
  parent.innerHTML = '';
  parent.append(content);
};

PokerChipz.prototype.viewCreateTable = function() {
  const self = this;
  const createTableEl = this.renderTemplate('tempCreateTable');
  const btnCreate = createTableEl.querySelector('#btnCreate');
  const btnJoinTemp = createTableEl.querySelector('#btnJoinTemp');

  btnCreate.onclick = () => {
    const playerName = document.querySelector('#nameCreate').value;
    const tableBuyIn = document.querySelector('#buyIn').value;
    self.socket.emit('createTable', { playerName: playerName, tableBuyIn: tableBuyIn });
  };

  btnJoinTemp.onclick = () => {
    self.viewJoinTable();
  };

  this.replaceElement(document.querySelector('main'), createTableEl);
};

PokerChipz.prototype.viewJoinTable = function() {
  const self = this;
  const joinTableEl = this.renderTemplate('tempJoinTable');
  const btnJoin = joinTableEl.querySelector('#btnJoin');

  btnJoin.onclick = () => {
    const playerName = document.querySelector('#nameJoin').value;
    const tableId = document.querySelector('#id').value;
    self.socket.emit('joinTable', { playerName: playerName, tableId: tableId });
  };

  this.replaceElement(document.querySelector('main'), joinTableEl);
};

PokerChipz.prototype.viewTable = function(tableId, playerName, tableBuyIn) {
  self = this
  const tableEl = this.renderTemplate('tempTable');
  tableEl.querySelector('#tableName').innerHTML = tableId;
  tableEl.querySelector('#playerChips').innerHTML = `<div id="your-chips-${playerName}">Your chips: ${tableBuyIn}</div>`;
  const btnBet = tableEl.querySelector('#btnBet');
  const btnTake = tableEl.querySelector('#btnTake');

  btnBet.onclick = () => {
    const betVal = document.querySelector('#inputBetChips').value;
    self.socket.emit('placeBet', { tableId: tableId, playerName: playerName, betVal: betVal });
  };

  btnTake.onclick = () => {
    const takeVal = document.querySelector('#inputTakeChips').value;
    self.socket.emit('takePot', { tableId: tableId, playerName: playerName, takeVal: takeVal });
  };

  this.replaceElement(document.querySelector('main'), tableEl);
};

PokerChipz.prototype.viewTableNews = function(data) {
  const mainEl = document.querySelector('main');
  const tableEl = mainEl.querySelector('#tempTable');
  tableEl.querySelector('#tableHistory').innerHTML += `<div>> ${data}</div>`;
};

PokerChipz.prototype.viewPlayers = function(data) {
  const mainEl = document.querySelector('main');
  const tableEl = mainEl.querySelector('#tempTable');
  const players = Object.entries(data);
  for (const [name, value] of players) {
    tableEl.querySelector('#players').innerHTML += `<div id="chips-${name}">${name}: ${value}</div>`;
  }
};

PokerChipz.prototype.viewNewPlayer = function(data) {
  const mainEl = document.querySelector('main');
  const tableEl = mainEl.querySelector('#tempTable');
  const name = data.playerName;
  const value = data.value;
  tableEl.querySelector('#players').innerHTML += `<div id="chips-${name}">${name}: ${value}</div>`;
};

PokerChipz.prototype.viewUpdatePlayer = function(data) {
  const mainEl = document.querySelector('main');
  const tableEl = mainEl.querySelector('#tempTable');
  const name = data.playerName;
  const value = data.value;
  const yourChips = tableEl.querySelector(`#your-chips-${name}`);
  if (yourChips) {
    yourChips.innerHTML = `Your chips: ${value}`;
  }
  tableEl.querySelector(`#chips-${name}`).innerHTML = `${name}: ${value}`;
};

window.onload = () => {
  window.app = new PokerChipz();
};
