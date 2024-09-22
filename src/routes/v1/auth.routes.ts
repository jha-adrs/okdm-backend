import { Router } from "express";
import passport from "passport";
import validate from "../../middleware/zod-validate";
import { authValidator } from "../../validators/auth.validator";
import { authController } from "../../controllers/auth.controller";

const router = Router();

router.post('/register', validate(authValidator.registerUserSchema), authController.registerUser)
router.post('/login',validate(authValidator.loginSchema), authController.loginUser)
router.post('/verify-email', validate(authValidator.verifyEmailSchema), authController.verifyEmail)
router.post('/verify-phone', validate(authValidator.verifyPhoneSchema), authController.verifyPhone)
router.post('/send-otp', validate(authValidator.sendOTPSchema), authController.sendOTP)
router.get("/google", passport.authenticate('google',{ scope: ["profile", "email"] }))
router.get('/google/callback', passport.authenticate('google', {successRedirect: "/v1/user/protected",failureRedirect: "/"}))

export default router;