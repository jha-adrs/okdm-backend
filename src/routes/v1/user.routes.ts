import { Router } from "express";
import passport from "passport";
import logger from "../../config/logger";
import checkAuthenticated from "../../middleware/checkAuthenticated";

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello World")
})

router.get("/protected", checkAuthenticated, (req, res) => {
    logger.info("Protected route accessed")
    const user = req.user;
    res.json({
        success: true,
        message: "Protected route",
        user
    })
});

export default router;