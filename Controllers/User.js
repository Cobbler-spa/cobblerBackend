import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken'
import userModel from '../Models/User.js'
import tokenModel from '../Models/Token.js'
import { validateEmail, validatePassword, validatePhone, validateString } from '../Utility/Validator.js';
import { generateOTP } from '../Utility/generateOTP.js';
import twilio from 'twilio';

//send token
export const sendToken = async (req, res) => {
    const { phoneNumber } = req.body;
  
    if (!validatePhone(phoneNumber)) {
      return res.status(400).json({ message: "Invalid Mobile number" });
    }
  
    try {
      const oldToken = await tokenModel.findOne({ phoneNumber });
        const oldUser = await userModel.findOne({email})
      if (oldUser) {
        return res.status(400).json({ message: "Already verified, please sign in" });
      }
  
      const otp = generateOTP(); // Generate the OTP
       // Convert the mobileNumber to a string
   const strOTP = otp.toString();

      // Save the phoneNumber and hashedOTP in your collection
      if(oldToken){
        await tokenModel.create({
            phoneNumber,
            otp:strOTP
          });
      }
      else{
        await tokenModel.updateOne({phoneNumber:phoneNumber}, {otp:strOTP})
      }
      
      const accountSid = 'ACe35aa31b5c0b9f74bd50433e956f8fa1';
      const authToken = '14086440f5f3c4a0d34e547074173282';
      const client = twilio(accountSid, authToken);
  
      client.messages
        .create({
          body: `your OTP(One-time password) for cobblerspa: ${otp}`,
          from: '+13203825803',
          to: `+91${phoneNumber}`,
        })
        .then(async (message) => {
          console.log(message.sid);
  
          
  
          // Return the success response
          return res.status(201).json({
            status: 'success',
            message: 'OTP sent successfully!',
          });
        })
        .catch((error) => {
          console.error(error);
  
          // Return the error response
          return res.status(400).json({ message: 'Unable to send OTP' });
        });
    } catch (error) {
      console.error(error);
      // Handle the error here
  
      return res.status(500).json({ message: 'Something went wrong' });
    }
  };



  // verifyOTP
export const verifyOTP = async (req, res) => {
    const { phoneNumber, otp } = req.body;
  
    try {
      const user = await tokenModel.findOne({ phoneNumber });
      const oldUser = await userModel.findOne({phoneNumber})
      if(oldUser){
        return res.status(400).json({message:"Already verified try loggin in!"})
      }
      if (!user) {
        return res.status(400).json({ message: "No such phone number" });
      }
  
      if (user.otp !== otp) {
        return res.status(401).json({ message: "OTP is incorrect" });
      }
  
      res.status(200).json({ message: "Mobile Number verified" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };
  

//signup
export const signUp = async (req, res) => {
    const {
        email,
        password,
        firstName,
        lastName,
        phoneNumber, address
    } = req.body;
    try {

        
        const oldUser = await userModel.findOne({
            email
        });

        if (oldUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Validate the email
        if (!validateEmail(email)) {
            return res.status(400).json({
                message: "Invalid email address"
            });
        }

        // Validate the password
        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Password should be at least 8 characters long and contain a combination of letters, numbers, and special characters",
            });
        }

        if(!validatePhone(phoneNumber)){
            return res.status(400).json({
                message:"Invalid mobile number"
            })
        }

        if(!validateString(address)){
            return res.status(400).json({
                message:"Invalid Address"
            })
        }

        const TokenUser = await tokenModel.findOne({phoneNumber})
        if(!TokenUser){
            return res.status(400).json({message:"User is not verified please verify!"});
        }

        // delete the user from usertoken collection
    await tokenModel.deleteOne({ phoneNumber: phoneNumber });

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await userModel.create({
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
            phoneNumber,
            address
        });

        const token = JWT.sign({
            email: result.email,
            id: result._id
        }, process.env.secret, {
            expiresIn: process.env.Expires_In,
        });
        res.status(201).json({
            status: 'success',
            data: {
                user: result,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong"
        });
        console.log(error);
    }
};



//signin
export const signIn = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const oldUser = await userModel.findOne({ email });
      if (!oldUser)
        return res.status(404).json({ message: "User doesn't exist" });
  
      const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
  
      if (!isPasswordCorrect)
        return res.status(400).json({ message: "Invalid credentials" });
  
      const token = JWT.sign({ email: oldUser.email, id: oldUser._id }, process.env.secret, {
        expiresIn:process.env.Expires_In,
      });
  
      res.status(200).json({ result: oldUser, token });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
      console.log(error);
    }
  };
  

