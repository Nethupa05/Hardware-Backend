import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://admin:1234@cluster01.e3dgkeq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster01")
.then(()=>{
    console.log("Connected to the database")
}).catch(()=>{
    console.log("Database connection failed")
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'NS Stores API is working!' });
});


app.listen( 5000, 
    ()=>{
        console.log('Server is running on port 5000');
    }
)

