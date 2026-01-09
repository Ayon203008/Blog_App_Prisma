import { Request, Response } from "express"
import { postService } from "./post.service"


const createPost = async (req: Request, res: Response) => {
    try {
        const result = await postService.createPost(req.body)
        res.send(201).json(result)
    } catch (err) {
        console.log(err)
    }
}

export const PostController = {
    createPost
}