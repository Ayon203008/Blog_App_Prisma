import express from "express"
import { PostController } from "./post.controlller"

const router = express.Router()

router.post("/",PostController.createPost)

export const postRouter = router