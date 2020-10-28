const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const db = require('knex')({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        user : 'postgres',
        password : 'kota11mentors',
        database : 'smartbrain_database'
    }
});

const app = express();
app.use(express.json())
app.use(cors());

app.get('/',(req,res)=>{
    db('users').join('login','users.email','=','login.email')
    .select('users.id','users.name','users.email','users.entries','users.joined')
    .then(resp=>{
        res.json(resp);
    });
})

app.post('/signin',(req, res)=>{
    const {email, password} = req.body;
    db.select('*').from('login').where('email','=',email)
    .then(info=>{
        const isValid = bcrypt.compareSync(password, info[0].hash)
        if(isValid)
            db.select('*').from('users')
            .where('email','=',email)
            .then(user=>res.json(user[0]));
        else
            res.status(400).json('failed')
    })
    .catch(err=>res.status(400).json('failed')); 
})

app.post('/register',(req, res)=>{
    const {name, email, password} = req.body;
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx('login').insert({
            email: email,
            hash : hash
        })
        .returning('email')
        .then(loginEmail => {
            return trx('users').insert({
                name:name,
                email:loginEmail[0],
            })
            .returning('*')
            .then(user=>res.json(user[0]));
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch(err=>res.status(400).json('exists'));
})

app.get('/profile/:id', (req,res) => {
    const {id} = req.params;
    db.select('*').from('users').where('id','=',id)
    .then(user=>{
        if(user.length>0)
            res.json(user[0])
        else
            res.status(400).json('Error getting profile');
    })
    .catch(err=>res.status(400).json('Error getting profile'));
})

app.put('/image', (req,res) => {
    let {id, nboxes} = req.body;
    db('users')
    .where('id','=',id)
    .increment('entries', nboxes)
    .returning('*')
    .then(user=>{
        if(user.length>0)
            res.json(user[0])
        else
            res.status(400).json('Error updating profile');
    })
    .catch(err=>res.status(400).json('Error updating profile'));
})

app.listen(3000);