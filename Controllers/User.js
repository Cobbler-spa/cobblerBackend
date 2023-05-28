import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken'
import userModel from '../Models/User.js'
import { validateEmail, validatePassword } from '../Utility/Validator.js';

//signup
export const signUp = async (req, res) => {
    const {
        email,
        password,
        firstName,
        lastName,
        phoneNumber
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
        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await userModel.create({
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
            phoneNumber
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
  

