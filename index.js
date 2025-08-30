import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

const app = express();

app.use(bodyParser.json())

mongoose.connect("mongodb+srv://admin:1234@cluster01.e3dgkeq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster01")
.then(()=>{
    console.log("Connected to the database")
}).catch(()=>{
    console.log("Database connection failed")
})




app.listen( 5000, 
    ()=>{
        console.log('Server is running on port 5000');
    }
)

