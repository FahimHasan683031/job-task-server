const express = require("express")
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser')
require('dotenv').config()
var jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 5000;


// middleware
app.use(express.json())
app.use(cors({
    origin: ["https://home-repair-d1660.web.app",
        "https://home-repair-d1660.firebaseapp.com",
        "https://home-repait.surge.sh",
        "http://localhost:5173"],
    credentials: true
}))




// mongodb connection
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.m2apie0.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // services apis
        const taskCollection = client.db("HomeRepair").collection("tasks")

        app.get('/tasks', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query.email = req.query.email
            }
            
            const result = await taskCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/tasks/:id',  async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.findOne(query)
            res.send(result)
        })

        app.post('/tasks', async (req, res) => {
            const data = req.body
            const result = await taskCollection.insertOne(data)
            res.send(result)
        })
        app.delete("/tasks/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id),
            };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        });
        app.put('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateService = {
                $set: {
                    serviceName: data.serviceName,
                    serviceImage: data.serviceImage,
                    providerName: data.providerName,
                    email: data.email,
                    price: data.price,
                    area: data.area,
                    providerDescription: data.providerDescription,
                    serviceDescription: data.serviceDescription,
                    providerImage: data.providerImage
                },
            }
            const result = await taskCollection.updateOne(filter, updateService, options)
            res.send(result)
        })



        
        // user collection apis
        const taskUserCollection = client.db("HomeRepair").collection("taskUser")

        app.get('/api/v1/users',async(req,res)=>{
            const result = await taskUserCollection.find().toArray()
            res.send(result)
        })
        app.post('/api/v1/users', async(req,res)=>{
            const user= req.body;
            const query = {email:user.email}
            const existingUser = await taskUserCollection.findOne(query)
            if(existingUser){
                return res.send({message:'user already exist', insertedId:null})
            }
            const result = await taskUserCollection.insertOne(user)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, (req, res) => {
    console.log(`server is running on the port of ${port}`)
})