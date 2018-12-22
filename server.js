const express = require('express');
const app = express();
const path = require('path');
const shortid = require('shortid');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

const serviceAccount = require(`${__dirname}/poker-chipz-37b2839404fd.json`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', express.static(path.join(__dirname + '/app/')));

app.post('/create-table', (req, res) => {
  const id = shortid.generate();
  console.log(id);
  const name = req.body.name;
  console.log(name);
})

const server = app.listen(8080, () => {
  // const host = server.address().address;
  const port = server.address().port;
  console.log(`server up on localhost:${port}`);
});