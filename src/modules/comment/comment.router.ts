import express, { NextFunction, Request, Response } from "express"
import { CommentController } from "./comment.controller"
import auth, { UserRole } from "../../middleware/auth"

const router = express.Router()

router.get("/:commentId", CommentController.getCommentById)

router.get("/author/:authorId", CommentController.getCommentByAuthor)

router.patch("/:commmetId",auth(UserRole.ADMIN, UserRole.USER),CommentController.UpdateComment)

router.post("/", auth(UserRole.ADMIN, UserRole.USER), CommentController.createComment)

router.delete("/:commentId", auth(UserRole.ADMIN, UserRole.USER), CommentController.DeleteComment)

export const CommentRouter = router
