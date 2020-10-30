const getUsers = (req, res, db) => {
    db('users').join('login','users.email','=','login.email')
    .select('users.id','users.name','users.email','users.entries','users.joined')
    .then(resp=>res.json(resp))
    .catch(err=>res.json('failed'));
}

module.exports = {
    getUsers : getUsers
}