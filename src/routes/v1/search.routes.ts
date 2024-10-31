import { Router } from "express";
import checkAuthenticated from "../../middleware/checkAuthenticated";
import { searchController } from "../../controllers/search.controller";

const router = Router();

//Search Unsplash
router.route("/unsplash").get(checkAuthenticated, searchController.searchUnsplash);
export default router;