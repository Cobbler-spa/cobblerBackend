import express from 'express'
import checkAuthToken from '../Middlewares/checkAuthToken.js';
import { addBlog, getAllBlogs, getBlog } from '../Controllers/Blog.js';


const router = express.Router();
router.post("/addblog", addBlog)
router.get("/", getAllBlogs)
router.get("/:id", getBlog)
export default router;