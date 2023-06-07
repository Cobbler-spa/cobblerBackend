import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import userModel from "../Models/User.js";
import tokenModel from "../Models/Token.js";
import newsModel from "../Models/News.js";
import {
  validateEmail,
  validatePassword,
  validatePhone,
} from "../Utility/Validator.js";
import { generateOTP } from "../Utility/generateOTP.js";
import twilio from "twilio";

//send token
export const sendToken = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!validatePhone(phoneNumber)) {
    return res.status(400).json({
      message: "Invalid Mobile number",
    });
  }

  try {
    const oldToken = await tokenModel.findOne({
      phoneNumber,
    });
    const oldUser = await userModel.findOne({
      phoneNumber,
    });
    if (oldUser) {
      return res.status(400).json({
        message: "Already verified, please sign in",
      });
    }

    const otp = generateOTP(); // Generate the OTP
    // Convert the mobileNumber to a string
    const hashedOTP = await bcrypt.hash(otp, 12);

    // Save the phoneNumber and hashedOTP in your collection
    if (!oldToken) {
      await tokenModel.create({
        phoneNumber,
        otp: hashedOTP,
      });
    } else {
      await tokenModel.updateOne(
        {
          phoneNumber: phoneNumber,
        },
        {
          otp: hashedOTP,
        }
      );
    }

    const accountSid = "ACe35aa31b5c0b9f74bd50433e956f8fa1";
    const authToken = "e0aa1723b9cc0b10187d43744f79a400";
    const client = twilio(accountSid, authToken);

    client.messages
      .create({
        body: `your OTP(One-time password) for cobblerspa: ${otp}`,
        from: "+13203825803",
        to: `+91${phoneNumber}`,
      })
      .then(async (message) => {
        console.log(message.sid);

        // Return the success response
        return res.status(201).json({
          status: "success",
          message: "OTP sent successfully!",
        });
      })
      .catch((error) => {
        console.error(error);

        // Return the error response
        return res.status(400).json({
          message: "Unable to send OTP",
        });
      });
  } catch (error) {
    console.error(error);
    // Handle the error here

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// verifyOTP
export const verifyOTP = async (req, res) => {
  const { phoneNumber, OTP } = req.body;

  try {
    const user = await tokenModel.findOne({
      phoneNumber,
    });
    const oldUser = await userModel.findOne({
      phoneNumber,
    });
    if (oldUser) {
      return res.status(400).json({
        message: "Already verified try loggin in!",
      });
    }
    if (!user) {
      return res.status(400).json({
        message: "No such phone number",
      });
    }
    const tokenIsCorrect = await bcrypt.compare(OTP, user.otp);
    if (!tokenIsCorrect) {
      return res.status(401).json({
        message: "OTP is incorrect",
      });
    }

    await tokenModel.updateOne({phoneNumber:phoneNumber}, {verified:true})
    res.status(200).json({
      success:"success",
      message: "Mobile Number verified",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

//signup
export const signUp = async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, address, newsLetterCheck } =
    req.body;
  try {
    const oldUser = await userModel.findOne({
      email,
    });

    if (oldUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Validate the email
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    // Validate the password
    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password should be at least 8 characters long and contain a combination of letters, numbers, and special characters",
      });
    }

    if (!validatePhone(phoneNumber)) {
      return res.status(400).json({
        message: "Invalid mobile number",
      });
    }

    

    const TokenUser = await tokenModel.findOne({
      phoneNumber,
    });
    if (!TokenUser || !TokenUser.verified) {
      return res.status(400).json({
        message: "User is not verified please verify!",
      });
    }

    // delete the user from usertoken collection
    await tokenModel.deleteOne({
      phoneNumber: phoneNumber,
    });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await userModel.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      phoneNumber,
      address,
      role:'customer'
    });

    if(newsLetterCheck){
     await newsModel.create({
        email
      })
    }
    
    const token = JWT.sign(
      {
        email: result.email,
        id: result._id,
      },
      process.env.secret,
      {
        expiresIn: process.env.Expires_In,
      }
    );
    res.status(201).json({
      status: "success",
      data: {
        user: {
          name: result.name,
          id: result._id,
          address:result.address,
          email:result.email,
          phoneNumber:result.phoneNumber,
          role:result.role
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
    console.log(error);
  }
};

//signin
export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await userModel.findOne({
      email,
    });
    if (!oldUser)
      return res.status(404).json({
        message: "User doesn't exist",
      });

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect)
      return res.status(400).json({
        message: "Invalid credentials",
      });

    const token = JWT.sign(
      {
        email: oldUser.email,
        id: oldUser._id,
      },
      process.env.secret,
      {
        expiresIn: process.env.Expires_In,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: {
          name: oldUser.name,
          id: oldUser._id,
          address:oldUser.address,
          email:oldUser.email,
          phoneNumber:oldUser.phoneNumber,
          role:oldUser.role
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
    console.log(error);
  }
};

//newsLetter

export const newsLetter = async (req, res) => {
  const { email } = req.body;
  try {
    const old = await newsModel.findOne({
      email,
    });
    if (old) {
      return res.status(400).json({
        message: "User Already exists!",
      });
    }
    const result = await newsModel.create({
      email,
    });

    return res.status(201).json({
      success: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "SOmething Went Wrong!",
    });
  }
};



//add admin
// add admin
export const addAdmin = async (req, res) => {
  const { email, password, phoneNumber, address, userId, firstName, lastName } = req.body;

  const existUser = await userModel.findOne({ email });
  if (existUser) {
    return res.status(400).json({
      message: "User already exists with this email",
    });
  }
  const existUserPhone = await userModel.findOne({ phoneNumber });
  if (existUserPhone) {
    return res.status(400).json({
      message: "User already exists with this phone number",
    });
  }
  
  const admin = await userModel.findById(userId);

  if (!admin || admin.role !== "admin") {
    return res.status(400).json({ message: "Unauthorized. Only admins can perform this action." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await userModel.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      phoneNumber,
      address,
      role: 'admin',
    });

    return res.status(201).json({
      status: "Success",
      user: {
        name: result.name,
        email: result.email,
        mobile: result.phoneNumber,
        role: result.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
    console.log(error);
  }
};
