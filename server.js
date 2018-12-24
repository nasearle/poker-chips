const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const shortid = require('shortid');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
var exphbs = require('express-handlebars');

const serviceAccount = require(`${__dirname}/poker-chipz-37b2839404fd.json`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('create-table');
});

app.post('/create-table', (req, res) => {
  const id = shortid.generate();
  console.log(id);
  const name = req.body.name;
  console.log(name);
  const buyIn = req.body.buyIn;
  const newTableRef = db.collection(id);
  newTableRef.doc('__buyIn').set({ value: buyIn });
  newTableRef.doc(name).set({ value: buyIn });
  res.render('table', { id: id, name: name, buyIn: buyIn });
});

app.get('/join-table', (req, res) => {
  res.render('join-table');
});

app.post('/join-table', async (req, res) => {
  const id = req.body.id;
  console.log(id);
  const name = req.body.name;
  console.log(name);
  const tableRef = db.collection(id);
  const buyInRef = await tableRef.doc('__buyIn').get();
  let buyInVal;
  if (buyInRef.exists) {
    buyInVal = buyInRef.data().value;
    console.log('Document data:', buyInVal);
  } else {
    // doc.data() will be undefined in this case
    console.log('No such document!');
  }
  db.collection(id).doc(name).set({ value: buyInVal });
  res.render('table', { id: id, name: name, buyIn: buyInVal });
});

io.on('connection', socket => {
  console.log('a user connected');

  socket.on('joinTable', async data => {
    try {
      const playerName = data.name;
      const tableId = data.id;
      socket.join(tableId, () => {
        io.to(tableId).emit(`${playerName} has joined the table`);
      });
      const tableRef = db.collection(tableId);
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