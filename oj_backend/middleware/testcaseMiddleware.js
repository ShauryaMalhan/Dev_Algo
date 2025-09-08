import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import Problem from '../models/problem.js';
import TestCase from '../models/testcase.js';

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
});

export const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const finalPath = `uploads/${req.problem.slug}/${file.originalname}`;
            cb(null, finalPath);
        }
    })
});

export const findProblemMiddleware = async (req, res, next) => {
    try {
        const problem = await Problem.findById(req.params.problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found.' });
        }
        req.problem = problem;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteExistingTestCases = async (req, res, next) => {
    try {
        const listParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Prefix: `uploads/${req.problem.slug}/`
        };
        const listedObjects = await s3.send(new ListObjectsV2Command(listParams));

        if (listedObjects.Contents && listedObjects.Contents.length > 0) {
            const deleteParams = {
                Bucket: process.env.S3_BUCKET_NAME,
                Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) },
            };
            await s3.send(new DeleteObjectsCommand(deleteParams));
        }

        await TestCase.deleteMany({ problemId: req.problem._id });
        next();
    } catch (error) {
        console.error("Failed to delete existing test cases:", error);
        res.status(500).json({ message: 'Failed to delete existing files.' });
    }
};