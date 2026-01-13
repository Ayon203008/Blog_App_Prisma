import { CommentStatus, Post, PostStatus } from "../../../generated/prisma/client";
import { SortOrder } from "../../../generated/prisma/internal/prismaNamespace";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
const createPost = async (data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    })
    return result
}
const getAllPost = async (payload: { search: string | undefined, tags: string[] | [], isFeatured: boolean | undefined, status: PostStatus | undefined, page: number, limit: number, skip: number, sortBy: string, sortOrder: string }) => {
    const andConditions: PostWhereInput[] = []
    if (payload.search) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: payload.search as string,
                        mode: "insensitive"  // ! letter can be lower or  uppercase
                    }
                },
                {
                    content: {
                        contains: payload.search as string,
                        mode: "insensitive"
                    }
                },
                {
                    tags: {
                        has: payload.search as string
                    }
                }
            ]
        })
    }
    if (payload.tags.length > 0) {
        andConditions.push(
            {
                tags: { // ! for searching with tags
                    hasEvery: payload.tags as string[]
                }
            })
    }
    if (typeof payload.isFeatured === 'boolean') {
        andConditions.push({
            isFeatured: payload.isFeatured
        })
    }
    if (payload.status) {
        andConditions.push({
            status: payload.status
        })
    }
    const allPost = await prisma.post.findMany({
        take: payload.limit,
        skip: payload.skip,
        where: {
            AND: andConditions
        },
        orderBy:
            payload.sortBy ? {
                [payload.sortBy]: payload.sortOrder || "desc"
            } : { createdAt: "desc" }


    })

    const total = await prisma.post.count({
        where: {
            AND: andConditions
        }
    })


    return {
        data: allPost,
        pagination: {
            total,
            page: payload.page,
            limit: payload.limit
        }
    }
}

// ! get post by their id

const getPostById = async (postId: string) => {
    const result = await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id: postId
            },
            data: {
                views: {
                    increment: 1
                }
            }
        })
        const postData = await tx.post.findUnique({
            where: {
                id: postId
            },
            include: {
                comments: {
                    where: {
                        parentId: null,
                        status: CommentStatus.APPROVED
                    },
                    orderBy: { createdAt: "desc" },
                    include: {
                        replies: {
                            where: {
                                status: CommentStatus.APPROVED
                            },
                            orderBy: { createdAt: "asc" },
                            include: {
                                replies: true
                            }
                        }
                    }
                },
                _count: {
                    select: { comments: true }
                }
            }
        })
        return postData
    })
    return result
}

const GetMyPosts = async (authorId: string) => {
    const result = await prisma.post.findFirstOrThrow({
        where: {
           id: authorId
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            _count: {
                select: {
                    comments: true
                }
            }
        }
    })

    const total = await prisma.post.count({
        where: {
            authorId
        }
    })

    return {
        data: result,
        total
    }
}



export const postService = {
    createPost,
    getAllPost,
    getPostById,

}