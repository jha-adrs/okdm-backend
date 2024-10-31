import { Request, Response } from "express";
import httpStatus from "http-status";
import logger from "../config/logger";
import { config } from "../config/config";
import axios from "axios";
import apiEndpoints from "../config/api";
import { z } from "zod";

const UnsplashResultsSchema = z.object({
    total: z.number().optional(),
    results: z.array(z.object({
        id: z.string(),
        user: z.object({
            name: z.string().optional(),
        }),
        urls: z.object({
            raw: z.string().optional(),
            full: z.string().optional(),
            regular: z.string().optional(),
            small: z.string().optional(),
            thumb: z.string().optional(),
        })
    },))
})

export const searchController = {
    searchUnsplash: async (req: Request, res: Response) => {
        try {
            const { search } = req.query;
            logger.info("Search unsplash images", search);
            const searchParams = new URLSearchParams();
            if (search) {
                searchParams.append("query", search as string);
            }
            searchParams.append("per_page", "30");
            searchParams.append("content_filter", "high");
            searchParams.append('orientation', 'landscape');
            searchParams.append('client_id', config.unsplash.accessKey as string);
            const { data } = await axios({
                method: "GET",
                url: apiEndpoints.UNSPLASH.SEARCH_PHOTOS,
                params: searchParams,
            });
            //logger.info("Search unsplash images", data);
            const result = UnsplashResultsSchema.parse(data);
            return res.status(httpStatus.OK).json({
                message: "Search Unsplash",
                data: result
            })
        } catch (error) {
            logger.error("ERROR IN SEARCH CONTROLLER, Search Unsplash", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Internal server error"
            })
        }
    }
}