import { Request, Response } from "express"
import { postService } from "./post.service"



const createPost = async (req: Request, res: Response) => {
    try {

        const user = req.user

        if (!user) {
            return res.status(400).json({
                error: "Unauthorized"
            })
        }
        const result = await postService.createPost(req.body, user.id as string)
        res.status(201).json(result)
    } catch (err) {
        console.log(err)
    }
}

export const PostController = {
    createPost
}