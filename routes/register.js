const handleRegister = (req, res, db, bcrypt) => {
    const {name, email, password} = req.body;
    if(!(name.length>0 && email.includes('@') && email.includes('.com') && password.length>=3))
        return res.json("invalid");
    const hash = bcrypt.hashSync(password);
    db.select('*').from('login').where('email','=',email)
    .then(info=>{
        if(info.length>0)
            return res.json('exists');
        else
        {
            return db.transaction(trx => {
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
                .catch(err=>{
                    trx.rollback;
                    res.status(400).json('failed');
                });
            })
        }
    })
    .catch(err=>res.status(400).json('failed'));
}

module.exports = {
    handleRegister : handleRegister
}