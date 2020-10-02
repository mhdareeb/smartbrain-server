const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

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
app.use(express.json())
app.use(cors());

function createNewUser(name, email){
    const lastID = database.users[database.users.length-1].id;
    const newID = Number(lastID)+1;
    const newUser = {
        id : String(newID),
        name : name,
        email : email,
        entries : 0,
        joined : new Date()
    }
    return newUser;
}

function checkSigIn(email, password)
{
    let isValid=false;
    let details;
    for(let i=0;i<database.users.length;i++)
    {
        let user=database.users[i];
        if(email===user.email)
        {
            for(let pwd of database.passwords)
            {
                if(pwd.id===user.id)
                {
                    isValid = bcrypt.compareSync(password, pwd.hash);
                    details = user;
                    break;
                }
            }
            break;
        }
    }
    return [isValid, details];
}


app.get('/',(req,res)=>{
    res.json(database);
})

app.post('/signin',(req, res)=>{
    const {email, password} = req.body;
    const [isValid, user] = checkSigIn(email, password);
    console.log(isValid, user);
    if(isValid)
        res.json(user);
    else
        res.status(400).json('failed');
})


app.post('/register',(req, res)=>{
    const {name, email, password} = req.body;
    console.log(name, email, password);
    const [isValid, user] = checkSigIn(email, password);
    if(isValid)
        res.json("exists");
    else
    {
        const newUser = createNewUser(name, email);
        database.users.push(newUser);
        bcrypt.hash(password, null, null, (err, hash) => {
            const newHash = {id:newUser.id, hash : hash};
            database.passwords.push(newHash);
        })
        console.log("added new user",database.users[database.users.length-1]);
        res.json(database.users[database.users.length-1]);
    }
})

app.get('/profile/:id', (req,res) => {
    const {id} = req.params;
    let found=false, i;
    for(i=0;i<database.users.length;i++)
    {
        if(database.users[i].id===id)
        {    
            found=true;
            break;
        }
    }
    if(found)
        res.json(database.users[i]);
    else
        res.status(400).json('not a valid user');
})

app.put('/image', (req,res) => {
    let {id} = req.body;
    for(let user of database.users)
    {
        if(user.id===id)
        {
            user.entries++;
            res.json(user.entries);
            break;
        }
    }
})

app.listen(3000);