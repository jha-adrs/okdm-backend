import { Router } from "express";
import logger from "../../config/logger";
import checkAuthenticated from "../../middleware/checkAuthenticated";
import { profileController } from "../../controllers/profile.controller";
import validate from "../../middleware/zod-validate";
import { profileValidator } from "../../validators/profile.validator";

const router = Router();

//router.get("/my-profile", checkAuthenticated, profileController.getMyProfile).post("/update-profile", checkAuthenticated, validate(profileValidator.updateProfileSchema), profileController.updateProfile)

router.get("/profile/:username",validate(profileValidator.getPublicProfileSchema), profileController.getPublicProfile);


export default router;