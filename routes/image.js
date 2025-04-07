const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + process.env.CLARIFAI_API_KEY);

const Clarifai = require('clarifai');

const handleAPICall = (req, res) => {

    stub.PostModelOutputs(
        {
            model_id: Clarifai.FACE_DETECT_MODEL,
            inputs: [{data: {image: {url: req.body.url}}}],
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
    
            console.log("Predicted concepts, with confidence values:")
            for (const c of response.outputs[0].data.concepts) {
                console.log(c.name + ": " + c.value);
            }
            res.json(response);
        }
    );

    app.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.url)
    .then(result=>res.json(result))
    .catch(err=> {
        console.error('Error calling Clarifai API:', err);
        return res.status(400).json('failed');
    })
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
