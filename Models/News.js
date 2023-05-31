import mongoose, {Schema} from 'mongoose'
const newsSchema = Schema({
    email:{
        type:String,
        required:true
    }
});


export default mongoose.model('NewsLetter', newsSchema)