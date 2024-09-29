import { Router } from "express";
import passport from "passport";
import validate from "../../middleware/zod-validate";
import { authValidator } from "../../validators/auth.validator";
import { authController } from "../../controllers/auth.controller";
import { config } from "../../config/config";
import checkAuthenticated from "../../middleware/checkAuthenticated";

const router = Router();
router.get('/check-username', authController.isUsernameTaken)
router.post('/register', validate(authValidator.registerUserSchema), authController.registerUser)
router.get('/login/success', authController.loginSuccess)
router.post('/login', validate(authValidator.loginSchema), authController.loginUser)
router.post('/verify-email', validate(authValidator.verifyEmailSchema), authController.verifyEmail)
router.post('/verify-phone', validate(authValidator.verifyPhoneSchema), authController.verifyPhone)
router.post('/send-otp', validate(authValidator.sendOTPSchema), authController.sendOTP);
router.post('/logout', authController.logoutUser)
router.get("/google", passport.authenticate('google', { scope: ["profile", "email"] }))
router.get('/google/callback', passport.authenticate('google', { successRedirect: `${config.clientUrl}/login/success`, failureRedirect: `${config.clientUrl}/login` }))

router.get("/verify-token", authController.verifyToken);
export default router;