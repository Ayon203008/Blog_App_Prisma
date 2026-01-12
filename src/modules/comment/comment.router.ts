import express, { NextFunction, Request, Response } from "express"
import { CommentController } from "./comment.controller"
import auth, { UserRole } from "../../middleware/auth"

const router = express.Router()

router.get("/:commentId",CommentController.getCommentById)

router.get("/author/:authorId",CommentController.getCommentByAuthor)

router.post("/",auth(UserRole.ADMIN,UserRole.USER),CommentController.createComment)

export const CommentRouter = router
