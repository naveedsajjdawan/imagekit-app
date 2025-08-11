import mongoose from "mongoose";

export interface IPhoto {
    title: string;
    description?: string;
    imageUrl: string;
    thumbnailUrl?: string;
    size: number;
    width?: number;
    height?: number;
    userId: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const photoSchema = new mongoose.Schema<IPhoto>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    size: {
        type: Number,
        required: true
    },
    width: {
        type: Number
    },
    height: {
        type: Number
    },
    userId: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
photoSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.Photo || mongoose.model<IPhoto>('Photo', photoSchema);
