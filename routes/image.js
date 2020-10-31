const Clarifai = require('clarifai');

const app = new Clarifai.App({
    apiKey: 'process.env.API_KEY
});

const handleAPICall = (req, res) => {
    app.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.url)
    .then(result=>res.json(result))
    .catch(err=>res.status(400).json('failed'));
}

const handleEntries = (req, res, db) => {
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
}

module.exports = {
    handleAPICall : handleAPICall,
    handleEntries : handleEntries
}
