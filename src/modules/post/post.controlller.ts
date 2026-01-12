import { Request, Response } from "express"
import { postService } from "./post.service"
import { PostStatus } from "../../../generated/prisma/enums"
import PaginationSortingHelper from "../../helpers/paginationSortingHelper"
import { success } from "better-auth/*"



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
        const tags = req.query.tags ? (req.query.tags as string).split(",") : []

        const isFeatured = req.query.isFeatured ?
            req.query.isFeatured === 'true' ? true : req.query.isFeatured === 'false' ? false : undefined
            : undefined
        // * declare isFeatured and pass it to the post.services.ts

        console.log(search)


        const status = req.query.status as PostStatus | undefined



        const {page,limit,skip,sortBy,sortOrder} = PaginationSortingHelper(req.query)




        const result = await postService.getAllPost({ search: searchString, tags, isFeatured, status, page, limit, skip, sortBy, sortOrder }) // # skip and limit
        res.status(200).json(result)
    } catch (e) {
        res.status(400).json({
            error: "Post creation failed",

        })
    }
}


const getPostById = async(req:Request,res:Response)=>{
    try{
        const {postId}=req.params

        if(!postId){
            throw new Error("Post id required")
        }

        const result = await postService.getPostById(postId)
        res.status(200).json(result)

    }catch(err){
        res.status(400).json({
            message:"Post get failed",
            success:false
        })
    }
}


const getMyPost = async(req:Request,res:Response)=>{
    try{
        const user = req.user
        if(!user){
            throw new Error("Unauthorized")
        }
        
        const result = await postService.GetMyPosts(user.id as string)
        res.status(200).json(result)

    }catch(err){
        res.status(400).json({
            message:"Post fetch failed",
            success:false
        })
    }
}

export const PostController = {
    createPost,
    getAllPost,
    getPostById,
    getMyPost
}