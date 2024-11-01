import { Router } from "express";
import logger from "../../config/logger";
import checkAuthenticated from "../../middleware/checkAuthenticated";
import { profileController } from "../../controllers/profile.controller";
import validate from "../../middleware/zod-validate";
import { profileValidator } from "../../validators/profile.validator";
import multer from 'multer'
import { cloudinaryService } from "../../utils/cloudinary";


const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image')) {
            return cb(new Error('Please upload an image'));
        }
        if (file.size > 1024 * 1024 * 5) {
            return cb(new Error('Image should be less than 5MB'));
        }
        cb(null, true);
    }
});
const router = Router();

router.get("/my-profile", checkAuthenticated, profileController.getMyProfile)
//.post("/update-profile", checkAuthenticated, validate(profileValidator.updateProfileSchema), profileController.updateProfile)

router.get("/profile/:username", validate(profileValidator.getPublicProfileSchema), profileController.getPublicProfile);
router.post("/update-avatar", checkAuthenticated, upload.single('avatar'), profileController.updateAvatar);
router.put("/update-theme", checkAuthenticated, profileController.updateTheme);
router.put("/update-background", checkAuthenticated, validate(profileValidator.updateBackgroundSchema), profileController.updateBackground);
router.put("/update-profile", checkAuthenticated, validate(profileValidator.updateProfile), profileController.updateProfile);
router.put("/update-username", checkAuthenticated,validate(profileValidator.updateUsername), profileController.updateUsername);
export default router;