import { generateFromEmail, generateUsername } from 'unique-username-generator';
import { userService } from '../services/user.service';
export const generateFakeUsername = async (email: string) => {
    const username = generateFromEmail(email);
    const isTaken = await userService.isUsernameTaken(username);
    if (isTaken) {
        //Generate a random one instead 
        return generateUsername("-", 5, 25, username).toLowerCase();
    }
    return username.toLowerCase();
}
