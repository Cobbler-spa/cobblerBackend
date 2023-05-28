import express from 'express'


const router = express.Router();

import {signUp,signIn} from '../Controllers/User.js';

router.post("/signup", signUp);
router.post("/signin",signIn );
export default router;