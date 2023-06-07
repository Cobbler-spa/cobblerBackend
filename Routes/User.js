import express from 'express'


const router = express.Router();

import {signUp,signIn, sendToken, verifyOTP, newsLetter, addAdmin} from '../Controllers/User.js';


router.post("/sendToken", sendToken)
router.post("/verify", verifyOTP)
router.post("/signup", signUp);
router.post("/signin",signIn );
router.post("/newsletter", newsLetter);
router.post("/addadmin", addAdmin);
export default router;