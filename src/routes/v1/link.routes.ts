import { Router } from "express"
import { linkController } from "../../controllers/link.controller";
import checkAuthenticated from "../../middleware/checkAuthenticated";
import validate from "../../middleware/zod-validate";
import { linkValidator } from "../../validators/link.validator";

const router = Router();
//Get all links
router.route("/")
    .get(checkAuthenticated, linkController.getLinks)
    .post(checkAuthenticated, validate(linkValidator.createLink), linkController.createLink);
router.route("/:linkID")
    .put(checkAuthenticated, validate(linkValidator.updateLink), linkController.updateLink)
    .delete(checkAuthenticated, validate(linkValidator.deleteLink), linkController.deleteLink);

export default router;