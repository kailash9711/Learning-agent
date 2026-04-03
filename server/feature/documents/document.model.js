import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {    
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [100, "Title must be less than 100 characters"]
        },
        fileName: {
            type: String,
            required: [true, "File name is required"],
            trim: true
        },
        filePath: {
            type: String,
            required: [true, "File path is required"],
            trim: true
        },
        fileSize: {
            type: Number,
            required: [true, "File size is required"],  
            min: [0, "File size must be a positive number"]
        },
        exactedText: {
            type: String,
            default: "" 
        }, chunks: [
            {
                content: { type: String, required: true },
                pageNumber: { type: Number, required: true },
                chunkIndex: { type: Number, required: true }
            }
        ],
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        lastAccessedAt: {
            type: Date,
            default: Date.now
        }   ,
        status: {
            type: String,
            enum: ['processing', 'ready', 'error'],
            default: 'processing'
        }

    },
    { timestamps: true }
);
documentSchema.index({ userId: 1, title: 1 }, { unique: true });
const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);
export default Document;