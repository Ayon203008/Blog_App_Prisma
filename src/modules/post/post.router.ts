import express, { NextFunction, Request, Response } from "express"
import { PostController } from "./post.controlller"
import auth, { UserRole } from "../../middleware/auth"
const router = express.Router()

router.get("/:postId",PostController.getPostById)

router.get("/", PostController.getAllPost)

router.post("/", auth(UserRole.USER), PostController.createPost)

router.get("/my-posts",auth(UserRole.USER,UserRole.ADMIN),PostController.getMyPost)

export const postRouter = router