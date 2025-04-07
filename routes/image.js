const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + process.env.CLARIFAI_PAT);

const USER_ID = 'clarifai';
const APP_ID = 'main';
const MODEL_ID = 'face-detection';

const handleAPICall = (req, res) => {

    stub.PostModelOutputs(
        {
            user_app_id: {
                "user_id": USER_ID,
                "app_id": APP_ID
            },
            model_id: MODEL_ID,
            model_version_id: process.env.CLARIFAI_MODEL_VERSION,
            inputs: [{data: {image: {url: req.body.url, allow_duplicate_url: true}}}],
        },
        metadata,
        (err, response) => {
            if (err) {
                console.log("Error: " + err);
                return;
            }    
            if (response.status.code !== 10000) {
                console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
                return;
            }
            res.json(response);
        }
    );
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
