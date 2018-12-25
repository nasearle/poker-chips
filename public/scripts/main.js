function PokerChipz() {
  const self = this;
  this.initTemplates();
  this.viewCreateTable();
  this.socket = io();

  this.socket.on('joinedTable', data => {
    const tableId = data.tableId;
    const playerName = data.playerName;
    const tableBuyIn = data.tableBuyIn;
    self.viewTable(tableId, playerName, tableBuyIn);
  });

  this.socket.on('tableNews', data => {
    self.viewTableNews(data);
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
  this.replaceElement(document.querySelector('main'), createTableEl);
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
};

PokerChipz.prototype.viewJoinTable = function() {
  const self = this;
  const joinTableEl = this.renderTemplate('tempJoinTable');
  this.replaceElement(document.querySelector('main'), joinTableEl);
  const btnJoin = joinTableEl.querySelector('#btnJoin');

  btnJoin.onclick = () => {
    const playerName = document.querySelector('#nameJoin').value;
    const tableId = document.querySelector('#id').value;
    self.socket.emit('joinTable', { playerName: playerName, tableId: tableId });
  };
};

PokerChipz.prototype.viewTable = function(tableId, playerName, tableBuyIn) {
  const tableEl = this.renderTemplate('tempTable');
  this.replaceElement(document.querySelector('main'), tableEl);
  tableEl.querySelector('#table-name').innerHTML = tableId;
};

PokerChipz.prototype.viewTableNews = function(data) {
  const mainEl = document.querySelector('main');
  const tableEl = mainEl.querySelector('#tempTable');
  tableEl.querySelector('#table-history').innerHTML = `> ${data}`;
};

window.onload = () => {
  window.app = new PokerChipz();
};