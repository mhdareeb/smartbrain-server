const handleSignin = (req, res, db, bcrypt) => {
    const {email, password} = req.body;
    if(!(email.includes('@') && email.includes('.com') && password.length>=3))
        return res.json("invalid");
    db.select('*').from('login').where('email','=',email)
    .then(info=>{
        if(info.length>0)
        {
            const isValid = bcrypt.compareSync(password, String(info[0].hash));
            if(isValid)
            {
                db.select('*').from('users')
                .where('email','=',email)
                .then(user=>res.json(user[0]));
            }
            else
                res.status(400).json('failed');    
        }
        else
            res.status(400).json('failed');
    })
    .catch(err=>res.status(400).json(err)); 
}

module.exports = {
    handleSignin : handleSignin
}