require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = (`${process.env.JWT_SECRET}`);
const PORT = process.env.PORT;

mongoose.connect(process.env.MONGODB_URI/* DATABASE_URL */, { // during dev, use DATABASE_URL
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

app.use('/', express.static(path.join(__dirname, 'views')));
app.use(bodyParser.json());

app.set('view-engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/result', (req, res) => {
  res.render('result.ejs', { name: 'Api' });
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.post('/api/result', async (req, res) => {
  const { token } = req.body;
  console.log(token);
  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log('server: ', user);
    console.log(user.username);
    const username = user.username;
    const data = await User.findOne({ username }).lean();
    console.log(data);
    return res.json({
      status: 'ok',
      username: data.username,
      hour: data.hour,
      minute: data.minute,
      distance: data.distance,
    });
  } catch (err) {
    return res.json({ status: 'error', error: err });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || typeof username != 'string') {
    return res.json({ status: 'error', error: 'invalid username' });
  }

  if (!password || typeof password != 'string') {
    return res.json({ status: 'error', error: 'invalid password' });
  }

  const user = await User.findOne({ username }).lean();

  if (!user) {
    return res.json({ status: 'error', error: 'invalid username/password' });
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET
    );
    return res.json({ status: 'ok', data: token });
  }
  res.json({ status: 'error', error: 'invalid username/password' });
});

app.post('/api/register', async (req, res) => {
  const {
    username,
    email,
    password: plaintext,
    hour,
    minute,
    distance,
  } = req.body;

  if (!username || typeof username != 'string') {
    return res.json({ status: 'error', error: 'invalid username' });
  }

  if (!plaintext || typeof plaintext != 'string') {
    return res.json({ status: 'error', error: 'invalid password' });
  }
  const password = await bcrypt.hash(plaintext, 10);

  try {
    const response = await User.create({
      username,
      password,
      email,
      hour,
      minute,
      distance,
    });
    console.log('user created successfully: ', response);
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ status: 'error', error: 'username already in use' });
    }
    throw error;
  }
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log('server up at 3000');
});
