import mongoose, {Schema} from "mongoose";


const userSchema = Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    id:{
        type:String
    },
    password:{
        type: String,
        required: false
    }

});

export default mongoose.model("User", userSchema);