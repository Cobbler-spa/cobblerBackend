import userModel from "../Models/User.js";
import BlogModel from "../Models/Blog.js";



export const getAllBlogs = async(req, res)=>{
    try {
        
        const blogs = await BlogModel.find();
        return res.status(200).json({
            status:"success",
            blogs:blogs
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error"})
    }
}


export const addBlog = async (req, res) => {
    const { title, description, image, userId } = req.body;
  
    try {
      const user = await userModel.findById(userId);
  
      if (!user || user.role !== 'admin') {
        return res.status(400).json({ message: "No admin with this user ID" });
      }
  
      const result = await BlogModel.create({
        title: title,
        description: description,
        image: image,
        user: user,
      });
  
      return res.status(201).json({
        status: "success",
        data: {
          blog: result,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  };
  

  //getBlog
  export const getBlog = async(req,res)=>{
     const {id} = req.params;

     try {
        const blog = await BlogModel.findById(id);

        if(!blog){
            return res.status(400).json({message:"No blog with this ID"})
        }

        return res.status(200).json({
            status:"success",
            data:{
                blog: blog
            }
        })

     } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Something went wrong!"})
     }
  }