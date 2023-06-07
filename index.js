import  express from "express";
import mongoose from "mongoose";
import cors from "cors"
import morgan from "morgan";
import dotenv from "dotenv";
import userRouter from './Routes/User.js'
import blogRouter from './Routes/Blog.js'
const app = express();

// dotenv.config(); //you will able to access the value defined in .env file
dotenv.config();
app.use(morgan("dev"));
app.use(express.json({
    limit: "30mb",
    extended: true
}));
app.use(express.urlencoded({
    limit: "30mb",
    extended: true
}));
app.use(cors());  //to satify request coming from the frontend

app.use("/api/v1/users/", userRouter); //http://localhost:5000/api/v1/users/signup
app.use("/api/v1/blogs/", blogRouter); //http://localhost:5000/api/v1/users/signup

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`)
    })
}).catch(error => {
    console.log(error)
})
app.get("/", (req, res) => {
    res.send("HEllo express");
})