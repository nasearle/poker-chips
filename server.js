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
      const tableBuyIn = data.tableBuyIn;
      const newTableRef = db.collection(tableId);
      newTableRef.doc('__buyIn').set({ value: tableBuyIn });
      newTableRef.doc(playerName).set({ value: tableBuyIn });
      socket.join(tableId);
      socket.emit('joinedTable', { tableId: tableId, playerName: playerName, tableBuyIn: tableBuyIn });
      io.to(tableId).emit('tableNews', `${playerName} has joined the table`);
    } catch (err) {
      console.log('There was an error');
    }
  });

  socket.on('joinTable', async data => {
    try {
      const tableId = data.tableId;
      const playerName = data.playerName;
      const tableRef = db.collection(tableId);
      const buyInRef = await tableRef.doc('__buyIn').get();
      let buyInVal;
      if (buyInRef.exists) {
        buyInVal = buyInRef.data().value;
        console.log('Document data:', buyInVal);
      } else {
        // doc.data() will be undefined in this case
        console.log('No such document!');
      }
      db.collection(tableId).doc(playerName).set({ value: buyInVal });
      socket.join(tableId);
      socket.emit('joinedTable', { tableId: tableId, playerName: playerName, tableBuyIn: tableBuyIn });
      io.to(tableId).emit('tableNews', `${playerName} has joined the table`);
      console.log(tableRef);

      const players = {};
      socket.emit('currentPlayers', players);
    } catch (err) {
      console.log('There was an error');
    }
  });
});

server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});