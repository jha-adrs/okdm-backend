import { S3Client } from "@aws-sdk/client-s3"
import { config } from "../config/config"

const s3Client = new S3Client({
    credentials: {
        accessKeyId: config.s3.accessKey,
        secretAccessKey: config.s3.secretKey
    },
    region: config.s3.region,
})


export const s3 = {

}