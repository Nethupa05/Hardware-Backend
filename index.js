import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import productRouter from './routers/productRoutes.js';
import userRouter from './routers/userRoutes.js';
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://nethupa:1234@cluster01.e3dgkeq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster01")
.then(()=>{
    console.log("Connected to the database")
}).catch(()=>{
    console.log("Database connection failed")
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'NS Stores API is working!' });
});


app.use("/api/products", productRouter)
app.use("/api/users", userRouter)




app.listen( 5000, 
    ()=>{
        console.log('Server is running on port 5000');
    }
)

