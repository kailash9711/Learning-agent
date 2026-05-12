import Document from "../documents/document.model.js";
import Flashcard from "../flashCard/flashcard.model.js";
import Quiz from "../quiz/quiz.model.js";

import extractTxtFromPDF from "../../utils/pdfParser.js";
import{ chunkText} from "../../utils/textChunker.js";
import fs from "fs/promises";
import path from "path";


import { asyncHandler } from "../../middleware/asyncHandler.js";
import mongoose from "mongoose";
import { error } from "console";
import { logActivity } from "../../utils/activityLogger.js";
// @desc    Upload a document
// @route   POST /api/documents
// @access  Private

    export const uploadDocument = async (req, res ,next) => {
        
        try {
            if(!req.file){
                return res.status(400).json({ success: false, error: "No file uploaded" });
            }

            const {title} = req.body;

            if(!title){
                return res.status(400).json({ success: false, error: "Title is required" });
            }

            //contruct the base URL for the uploaded file

            const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
            const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

            //create a new document in the database
            const document = await Document.create({
                userId: req.user._id,
                title,
                fileName : req.file.filename,
                filePath : fileUrl,
                fileSize : req.file.size,
                status: "processing"
            });

            //process the PDF in the background
            processPDF(document._id, req.file.path).catch((error) => {
                console.error(`Error processing document ${document._id}:`, error);
                //update document status to failed
                Document.findByIdAndUpdate(document._id, { status: "error" }).exec();
            });

            logActivity(req.user._id, 'upload_document', document._id);

            res.status(201).json({ success: true, data: document , message: "Document uploaded successfully, processing in background" });
        } catch (error) {
            console.error("Error uploading document:", error);
            res.status(500).json({ success: false, error: "Failed to upload document" });
        }
    }; 

    //helper function to process the PDF and extract text, create flashcards and quiz
    const processPDF = async (documentId, filePath) => {
       try {
        const {text} = await extractTxtFromPDF(filePath);

        //create text chunks
        const chunks = chunkText(text, 500, 100); //chunk size of 500 characters, overlap of 100 characters

        //update the document with extracted text and chunks
        await Document.findByIdAndUpdate(documentId, {
            exactedText: text,
            chunks: chunks,
            status: "ready"
        });

        console.log(`Document ${documentId} processed successfully with ${chunks.length} chunks created.`);
       } catch (error) {
        console.error(`Error processing PDF for document ${documentId}:`, error);
        await Document.findByIdAndUpdate(documentId, { status: "error" }).exec();
       }
        
    }


    export const getDocuments = async (req, res,next) => {

        try {
             const documents = await Document.aggregate([

            { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
            {
                $lookup: {
                    from: "flashcards",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "flashcards"
                }
            },
            {
                $lookup: {
                    from: "quizzes",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "quizzes"
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: "$flashcards" },
                    quizCount: { $size: "$quizzes" }
                }
            },
            {   
                $project: { 
                    exactedText : 0,
                    chunks: 0,
                    flashcards: 0,
                    quizzes: 0
                }
            },
            {
            $sort: { uploadedAt: -1 }}
        ]);
        
        res.status(200).json({data: documents, count: documents.length, success: true });
        } catch (error) {
            console.log(error)
        }
    };


    export const getDocument = async(req,res,next)  => {
        try {
            const document = await Document.findOne({
                _id : req.params.id,
                userId : req.user._id
            })

            if(!document){
                res.status(404).json({
                    success : false,
                    error : "document not found"
                });
            }

//get count of flashcard and quiz 
            const flashcardCount = await Flashcard.countDocuments({documentId : document._id ,  userId : req.user._id});
            const quizCount = await Quiz.countDocuments({documentId : document._id , userId:req.user._id});

            //updated last access

            document.lastAccess = Date.now();
            await document.save();

            //combine document data with count 

            const documentData = document.toObject();
            documentData.flashcardCount = flashcardCount;
            documentData.quizCount = quizCount;

             res.status(200).json({
                    success : true,
                    data :  documentData,
                });

        } catch (error) {
         next(error)   
        }
    }

    export const deleteDocument = async(req,res,next) => {
        try {
            const document = await Document.findOne({
                _id : req.params.id,
                userId : req.user._id
            })

            if(!document){
                res.status(404).json({
                    success : false,
                    error : "document not found"
                });
            }

            //delete file from file system

            const filePath = path.join(process.cwd(), "public", "uploads", "documents", document.fileName);
            await fs.unlink(filePath).catch(() => {});

            await document.deleteOne();
            res.status(200).json({
                success: true,
                message : "file deleted successfully"
            })
        } catch (error) {
            next(error);
        }
    }
