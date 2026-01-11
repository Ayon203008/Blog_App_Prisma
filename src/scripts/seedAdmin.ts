import { prisma } from "../lib/prisma"
import { UserRole } from "../middleware/auth"

async function seedAdmin() {
    try {
        // check the user it exits in the databse or not

        const adminData = {
            name: "Admin Shaheb",
            email: "admin@admin.com",
            role: UserRole.ADMIN,
            password: "734y5dbfjb",

        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: adminData.email
            }
        })

        if (existingUser) {
            throw new Error("User already exists in DB!!")
        }

        const signUpAdmin = await fetch("http://localhost:3000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(adminData)
        })

        if(signUpAdmin.ok){
            await prisma.user.update({
                where:{
                    email:adminData.email
                },
                data:{
                    emailVerified:true
                }
            })
        }

    } catch (error) {
        console.error(error)
    }
}

seedAdmin()