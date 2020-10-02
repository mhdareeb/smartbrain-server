const express = require('express');
const bcrypt = require('bcrypt-nodejs');

let database = {
    users : [
        {
            id : '123',
            name : 'John',
            email : 'john@gmail.com',
            entries : 0,
            joined : new Date()
        },
        {
            id : '124',
            name : 'Sally',
            email : 'sally@gmail.com',
            entries : 0,
            joined : new Date()
        }
    ],
    passwords : [
        {
            id : '123',
            hash : '$2a$10$ysF6uQpAE1NgHwh/1hkyQOd4u3I3Jd4vYN1XvfBuOODGPgvb/OZW.'
        },
        {
            id : '124',
            hash : '$2a$10$7XszEnCKKhCE0IxrEivFXudvrZ4EKhlSF86NkIbrFAIoQ9QPgYsMW'
        }
    ]
}


const app = express();

function createNewUser(name, email, password){
    const lastID = database.users[database.users.length-1].id;
    const newID = Number(lastID)+1;
    const newUser = {
        id : newID,
        name : name,
        email : email,
        entries : 0,
        joined : new Date()
    }
    return newUser;
}

app.use(express.json())

app.get('/',(req,res)=>{
    res.send(database);
})

app.post('/signin',(req, res)=>{
    const {email, password} = req.body;
    let isValid = false;
    let isRegistered = false;
    let id;
    for(let user of database.users)
    {
        if(email===user.email)
        {
            isRegistered=true;
            id=user.id;
            break;
        }
    }
    if(isRegistered)
    {
        for(let pwd of database.passwords)
        {
            if(pwd.id===id)
            {
                isValid = bcrypt.compareSync(password, pwd.hash);
                break;
            }
        }
    }
    if(isValid)
        res.send('signing in');
    else
        res.status(400).send('not a valid user');
})


app.post('/register',(req, res)=>{
    const {name, email, password} = req.body;
    const newUser = createNewUser(name, email, password);
    database.users.push(newUser);
    bcrypt.hash(password, null, null, (err, hash) => {
        const newHash = {id:newUser.id, hash : hash};
        database.passwords.push(newHash);
    })
    res.send(database.users[database.users.length-1]);
})

app.listen(3000);
