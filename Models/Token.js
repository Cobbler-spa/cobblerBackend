import mongoose , {Schema} from 'mongoose'

const tokenSchema = Schema({

    phoneNumber:{
        type: String,
        requred: true,
        unique: true
    },
    otp:{
        type:String
    }
})


export default mongoose.model('Token', tokenSchema)