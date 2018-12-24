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

app.get('/', function (req, res) {
  res.render('home');
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
    console.log("Document data:", buyInVal);
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
  }
  db.collection(id).doc(name).set({ value: buyInVal });
  res.render('table', { id: id, name: name, buyIn: buyInVal });
});

io.on('connection', socket => {
  console.log('a user connected');

  socket.on('signIn', async data => {
    try {
      await isValidPassword(data);
      console.log('password is valid');

      socket.emit('signInResponse', { success: true });
      // if the player doesn't already have an existing session, create a new player
      // (check prevents creating multiple ships when browser auto disconnects
      // and reconnects socket)
      if (!socket.handshake.session.ship_exists) {
        // create a new player and add it to our players object
        players[socket.id] = {
          rotation: 0,
          x: Math.floor(Math.random() * 700) + 50,
          y: Math.floor(Math.random() * 500) + 50,
          playerId: socket.id,
          hp: PLAYERHP,
          kills: 0
        };
        // send the players object to the new player
        socket.emit('currentPlayers', players);
        // send the star object to the new player
        socket.emit('starLocation', star);
        // send the current scores
        // socket.emit('scoreUpdate', players[socket.id].kills);
        // update all other players of the new player
        socket.broadcast.emit('newPlayer', players[socket.id]);
        socket.handshake.session.ship_exists = true;
        socket.handshake.session.save();
      }
    } catch (err) {
      socket.emit('signInResponse', {
        success: false,
        message: err.message,
      });
    }
  });

  socket.on('signUp', async data => {
    try {
      await isUsernameAvailable(data);
      await addUser(data);
      socket.emit('signUpResponse', { success: true });
    } catch (err) {
      socket.emit('signUpResponse', { success: false, message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });
});

server.listen(8081, () => {
  console.log(`Listening on ${server.address().port}`);
});