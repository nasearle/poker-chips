const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const shortid = require('shortid');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

const serviceAccount = require(`${__dirname}/poker-chipz-37b2839404fd.json`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
  console.log('a user connected');

  socket.on('createTable', async data => {
    try {
      const tableId = shortid.generate();
      const playerName = data.playerName;
      const numTableBuyIn = Number(data.tableBuyIn);
      const newTableRef = db.collection(tableId);
      newTableRef.doc('__buyIn').set({ value: numTableBuyIn });
      newTableRef.doc('__pot').set({ value: 0 });
      newTableRef.doc(playerName).set({ value: numTableBuyIn });
      socket.join(tableId);
      socket.emit('joinedTable', { tableId: tableId, playerName: playerName, tableBuyIn: numTableBuyIn });
      io.to(tableId).emit('tableNews', `${playerName} has joined the table`);
      const player = {};
      player[playerName] = numTableBuyIn;
      socket.emit('currentPlayers', player);
    } catch (err) {
      console.log('There was an error');
      console.log(err);
    }
  });

  socket.on('joinTable', async data => {
    try {
      const tableId = data.tableId;
      const playerName = data.playerName;
      const tableRef = db.collection(tableId);
      const buyInDoc = await tableRef.doc('__buyIn').get();
      const numBuyInVal = Number(buyInDoc.data().value);
      db.collection(tableId).doc(playerName).set({ value: numBuyInVal });
      socket.join(tableId);
      socket.emit('joinedTable', { tableId: tableId, playerName: playerName, tableBuyIn: numBuyInVal });
      socket.broadcast.to(tableId).emit('newPlayer', { playerName: playerName, value: numBuyInVal });
      io.to(tableId).emit('tableNews', `${playerName} has joined the table`);
      const players = {};
      const blacklist = ['__buyIn', '__pot'];
      const playersSnapshot = await tableRef.get();
      playersSnapshot.forEach(doc => {
        if (blacklist.indexOf(doc.id) === -1) {
          players[doc.id] = doc.data().value;
        }
      });
      socket.emit('currentPlayers', players);
    } catch (err) {
      console.log('There was an error');
      console.log(err);
    }
  });

  socket.on('placeBet', async data => {
    try {
      const tableId = data.tableId;
      const playerName = data.playerName;
      const numBetVal = Number(data.betVal);
      const tableRef = db.collection(tableId);
      const playerDoc = await tableRef.doc(playerName).get();
      let numPlayerVal;
      if (playerDoc.exists) {
        numPlayerVal = Number(playerDoc.data().value);
      } else {
        console.log('No such document!');
        // socket.emit('error', 'player does not exist');
        return
      }
      if (numBetVal <= numPlayerVal) {
        numPlayerVal -= numBetVal;
        tableRef.doc(playerName).set({ value: numPlayerVal });
        io.to(tableId).emit('updatePlayer', { playerName: playerName, value: numPlayerVal });
        io.to(tableId).emit('tableNews', `${playerName} bets ${numBetVal}`);
        const potDoc = await tableRef.doc('__pot').get();
        let numPotVal = Number(potDoc.data().value);
        numPotVal += numBetVal;
        tableRef.doc('__pot').set({ value: numPotVal });
        io.to(tableId).emit('tableNews', `the pot is now ${numPotVal}`);
      } else {
        socket.emit('error', `Bet of ${numBetVal} is more than ${playerName}'s value of ${numPlayerVal}`);
      }
    } catch (err) {
      console.log('There was an error');
      console.log(err);
    }
  });

  socket.on('takePot', async data => {
    try {
      const tableId = data.tableId;
      const playerName = data.playerName;
      const numTakeVal = Number(data.takeVal);
      const tableRef = db.collection(tableId);
      const playerDoc = await tableRef.doc(playerName).get();
      let numPlayerVal;
      if (playerDoc.exists) {
        numPlayerVal = Number(playerDoc.data().value);
      } else {
        console.log('No such document!');
        // socket.emit('error', 'player does not exist');
        return
      }
      const potDoc = await tableRef.doc('__pot').get();
      let numPotVal = Number(potDoc.data().value);
      if (numTakeVal <= numPotVal) {
        numPlayerVal += numTakeVal;
        tableRef.doc(playerName).set({ value: numPlayerVal });
        io.to(tableId).emit('updatePlayer', { playerName: playerName, value: numPlayerVal });
        io.to(tableId).emit('tableNews', `${playerName} takes ${numTakeVal} from the pot`);
        numPotVal -= numTakeVal;
        tableRef.doc('__pot').set({ value: numPotVal });
        io.to(tableId).emit('tableNews', `the pot is now ${numPotVal}`);
      } else {
        socket.emit('error', `Amount of ${numTakeVal} is more than the pot value of ${numPotVal}`);
      }

    } catch (err) {
      console.log('There was an error');
      console.log(err);
    }
  })
});

server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});
