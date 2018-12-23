const express = require('express');
const app = express();
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

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', express.static(path.join(__dirname + '/')));

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

const server = app.listen(8080, () => {
  // const host = server.address().address;
  const port = server.address().port;
  console.log(`server up on localhost:${port}`);
});