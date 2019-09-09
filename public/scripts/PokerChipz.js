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

PokerChipz.prototype.hideTemplates = function() {
  document.querySelectorAll('.template').forEach(el => {
    el.classList.add('hide');
  });
}

PokerChipz.prototype.replaceElement = function(parent, content) {
  parent.innerHTML = '';
  parent.append(content);
};

PokerChipz.prototype.viewCreateTable = function() {
  const self = this;
  this.hideTemplates();
  const createTableEl = document.querySelector('#tempCreateTable');
  const btnCreate = createTableEl.querySelector('#btnCreate');
  const linkJoinTemp = createTableEl.querySelector('#linkJoinTemp');

  btnCreate.onclick = () => {
    const playerName = document.querySelector('#nameCreate').value;
    const tableBuyIn = document.querySelector('#buyIn').value;
    self.socket.emit('createTable', { playerName: playerName, tableBuyIn: tableBuyIn });
  };

  linkJoinTemp.onclick = (event) => {
    event.preventDefault();
    self.viewJoinTable();
  };

  createTableEl.classList.remove('hide');
};

PokerChipz.prototype.viewJoinTable = function() {
  const self = this;
  this.hideTemplates();
  const joinTableEl = document.querySelector('#tempJoinTable');
  const btnJoin = joinTableEl.querySelector('#btnJoin');

  btnJoin.onclick = () => {
    const playerName = document.querySelector('#nameJoin').value;
    const tableId = document.querySelector('#id').value;
    self.socket.emit('joinTable', { playerName: playerName, tableId: tableId });
  };

  joinTableEl.classList.remove('hide');
};

PokerChipz.prototype.viewTable = function(tableId, playerName, tableBuyIn) {
  self = this
  this.hideTemplates();
  const tableEl = document.querySelector('#tempTable');
  tableEl.querySelector('#tableName').innerHTML = tableId;
  tableEl.querySelector('#playerChips').innerHTML = `<div id="your-chips-${playerName}">Your chips: ${tableBuyIn}</div>`;
  const btnBet = tableEl.querySelector('#btnBet');
  const btnTake = tableEl.querySelector('#btnTake');
  const sliderBet = tableEl.querySelector('#inputBetChips');
  const sliderTake = tableEl.querySelector('#inputTakeChips');

  const tabs = tableEl.querySelectorAll('.tabs');
  for (let i = 0; i < tabs.length; i++) {
    M.Tabs.init(tabs[i]);
  }

  sliderBet.oninput = () => {
    console.log('bet slider change');

    const betVal = document.querySelector('#inputBetChips').value;
    console.log(btnBet);

    btnBet.innerHTML = `Bet ${betVal}`;
    console.log(btnBet.innerHtml);

  }

  sliderTake.oninput = () => {
    const takeVal = document.querySelector('#inputBetChips').value;
    btnTake.innerHTML = `Take ${takeVal}`;
  }

  btnBet.onclick = () => {
    const betVal = document.querySelector('#inputBetChips').value;
    self.socket.emit('placeBet', { tableId: tableId, playerName: playerName, betVal: betVal });
  };

  btnTake.onclick = () => {
    const takeVal = document.querySelector('#inputTakeChips').value;
    self.socket.emit('takePot', { tableId: tableId, playerName: playerName, takeVal: takeVal });
  };

  tableEl.classList.remove('hide');
};

PokerChipz.prototype.viewTableNews = function(data) {
  const tableEl = document.querySelector('#tempTable');
  tableEl.querySelector('#tableHistory').innerHTML += `<div>> ${data}</div>`;
};

PokerChipz.prototype.viewPlayers = function(data) {
  const tableEl = document.querySelector('#tempTable');
  const players = Object.entries(data);
  for (const [name, value] of players) {
    tableEl.querySelector('#players').innerHTML += `<div id="chips-${name}">${name}: ${value}</div>`;
  }
};

PokerChipz.prototype.viewNewPlayer = function(data) {
  const tableEl = document.querySelector('#tempTable');
  const name = data.playerName;
  const value = data.value;
  tableEl.querySelector('#players').innerHTML += `<div id="chips-${name}">${name}: ${value}</div>`;
};

PokerChipz.prototype.viewUpdatePlayer = function(data) {
  const tableEl = document.querySelector('#tempTable');
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
