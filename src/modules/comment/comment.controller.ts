import { Request, Response } from "express"
import { CommentService } from "./comment.servics"
import { string } from "better-auth/*"


const createComment = async (req: Request, res: Response) => {
    try {

        const user = req.user
        req.body.authorId = user?.id
        const result = await CommentService.createComment(req.body)
        res.status(201).json(result)


    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Comment creation failed"
        })
    }
}
const getCommentById = async (req: Request, res: Response) => {
    try {

        const { commentId } = req.params
        const result = await CommentService.getCommentById(commentId as string)
        res.status(201).json(result)


    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Comment fetched failed"
        })
    }
}
const getCommentByAuthor = async (req: Request, res: Response) => {
    try {

        const { authorId } = req.params
        const result = await CommentService.getCommentById(authorId as string)
        res.status(201).json(result)


    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Comment fetched failed"
        })
    }
}

const DeleteComment = async (req: Request, res: Response) => {
    try {

        const user = req.user
        const { commentId } = req.params
        const result = await CommentService.deleteComment(commentId as string, user?.id as string)
        res.status(201).json(result)


    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Comment delete failed"
        })
    }
}

const UpdateComment = async (req: Request, res: Response) => {
    try {

        const user = req.user
        const { commentId } = req.params
        const result = await CommentService.updateComment(commentId as string, req.body, user?.id as string)
        res.status(201).json(result)


    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Comment update  failed"
        })
    }
}


const ModarateComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params
        const result = await CommentService.modarateComment(commentId as string, req.body)
        res.status(201).json(result)
    } catch (e) {
        const errorMessage = (e instanceof Error) ? e.message : "Comment Update Failed"

        res.status(400).json({
            success: false,
            message: errorMessage
        })
    }
}




export const CommentController = {
    createComment,
    getCommentById,
    getCommentByAuthor,
    DeleteComment,
    UpdateComment,
    ModarateComment
}