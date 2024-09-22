import prisma from "../config/db"

export const profileService = {
    getPublicProfile: async (userID: string) => {

        const profile = await prisma.userProfile.findFirst({
            where: {
                userId: userID
            },
            select: {
                profile_url: true,
                userId: true,
                headline: true,
                bio: true,
                avatar: true,
                location: true,
                website: true,
                designation: true,
                designation_location: true,
                UserLinks: {
                    where: {
                        isVisible: true
                    }
                }
            }
        });
        return profile
    }
}