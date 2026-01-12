import { Request, Response } from "express"
import { CommentService } from "./comment.servics"


const createComment = async (req: Request, res: Response) => {
    try {

        const user = req.user
        req.body.authorId=user?.id
        const result = await CommentService.createComment(req.body)
        res.status(201).json(result)


    } catch (err) {
          res.status(400).json({
            success:false,
            message:"Comment creation failed"
          })
    }
}


const getCommentById = async (req: Request, res: Response) => {
    try {

        const {commentId}=req.params
        const result = await CommentService.getCommentById(commentId as string)
        res.status(201).json(result)


    } catch (err) {
          res.status(400).json({
            success:false,
            message:"Comment fetched failed"
          })
    }
}


const getCommentByAuthor = async (req: Request, res: Response) => {
    try {

        const {authorId}=req.params
        const result = await CommentService.getCommentById(authorId as string)
        res.status(201).json(result)


    } catch (err) {
          res.status(400).json({
            success:false,
            message:"Comment fetched failed"
          })
    }
}


export const CommentController = {
    createComment,
    getCommentById,
    getCommentByAuthor
}