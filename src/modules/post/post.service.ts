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
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            id: authorId,
            status: "ACTIVE"  // * user an get post while he was active only
        },
        select: {
            id: true,
            status: true
        }
    })


    const result = await prisma.post.findMany({
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

    return {
        result,

    }
}
// * For update user individual post
const updatePost = async (postId: string, data: Partial<Post>, authorId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }
    })
    if ((postData.authorId !== authorId) && !isAdmin) {
        throw new Error("You are not the creator of the post")
    }
    if (!isAdmin) {
        delete data.isFeatured
    }
    const result = await prisma.post.update({
        where: {
            id: postData.id
        },
        data
    })
    return result
}


const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }
    })

    if ((postData.authorId !== authorId) && !isAdmin) {
        throw new Error("You are not the creator of the post")
    }

    return await prisma.post.delete({
        where: {
            id: postId
        }
    })

}

const GetStatus = async () => {
    return await prisma.$transaction(async (tx) => {

        const [totalPost, publishedPost, archrivedPosts, draftPosts, totalComments, approvedComments, totalUsers, adminCount, UserCount,totalViews] = await Promise.all([
            await tx.post.count(),
            await tx.post.count({where: {status: PostStatus.PUBLISHED}}),
            await tx.post.count({where: {status: PostStatus.ARCHIVED}}),
            await tx.post.count({where: {status: PostStatus.DRAFT}}),
            await tx.comment.count(),
            await tx.comment.count({where: {status: CommentStatus.APPROVED}}),
            await tx.user.count(),
            await tx.user.count({where: { role: "ADMIN" }}),
            await tx.user.count({where:{role:"USER"}}),
            await tx.post.aggregate({_sum:{views:true}})
        ])

        return {
            archrivedPosts,
            totalPost,
            draftPosts,
            publishedPost,
            totalComments,
            approvedComments,
            totalUsers,
            adminCount,
            UserCount,
            totalViews
        }
    })
}


export const postService = {
    createPost,
    getAllPost,
    getPostById,
    GetMyPosts,
    updatePost,
    deletePost,
    GetStatus

}