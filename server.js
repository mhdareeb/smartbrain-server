const express = require('express');

const base = require('./routes/base')
const signin = require('./routes/signin');
const register = require('./routes/register');
const profile = require('./routes/profile');
const image = require('./routes/image');

const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const db = require('knex')({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        user : 'postgres',
        password : 'abcd1234',
        database : 'smartbrain_database'
    }
});

const app = express();
app.use(express.json())
app.use(cors());

app.get('/',(req,res) => {base.getUsers(req, res, db)});
app.post('/signin',(req, res) => {signin.handleSignin(req, res, db, bcrypt)});
app.post('/register',(req, res) => {register.handleRegister(req, res, db, bcrypt)});
app.get('/profile/:id', (req,res) => {profile.getProfile(req, res, db)});
app.post('/detect',(req, res) => image.handleAPICall(req, res));
app.put('/image', (req,res) => {image.handleEntries(req, res, db)});
app.listen(process.env.PORT);