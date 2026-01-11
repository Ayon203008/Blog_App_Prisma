import { Request, Response } from "express"
import { postService } from "./post.service"
import { PostStatus } from "../../../generated/prisma/enums"



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


const getAllPost = async (req: Request, res: Response) => {
    try {
        const { search } = req.query
        const searchString = typeof search === 'string' ? search : undefined
        const tags = req.query.tags  ? (req.query.tags as string).split(",") : []

        const isFeatured = req.query.isFeatured ?
         req.query.isFeatured==='true' ? true : req.query.isFeatured==='false'? false:undefined
         : undefined
        // * declare isFeatured and pass it to the post.services.ts

        console.log(search)


        const status = req.query.status as PostStatus | undefined

        const result = await postService.getAllPost({ search: searchString,tags,isFeatured,status })
        res.status(200).json(result)
    } catch (e) {
        res.status(400).json({
            error: "Post creation failed",

        })
    }
}


export const PostController = {
    createPost,
    getAllPost
}