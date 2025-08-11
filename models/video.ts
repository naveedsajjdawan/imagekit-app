import mongoose,{Schema, model, models} from "mongoose"

export const VIDEO_DIMENSIONS = {
    width: 1080, 
    height: 1920,
} as const

export interface IVideo {
    _id?: mongoose.Types.ObjectId;
    title?: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    controls?: boolean;
    size?: number;
    duration?: number;
    userId?: string;
    transformations?:{
        height:number;
        width:number;
        quality?:number;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

const VideoSchema = new Schema<IVideo> (
    {
        title: {type: String, required: true},
        description:{type: String, default: ""},
        thumbnailUrl:{type: String, default: ""},
        videoUrl: {type: String, required: true},
        size: { type: Number, default: 0 },
        duration: { type: Number, default: 0 },
        userId: { type: String, default: "" },
        controls:{type: Boolean, default: true},
        transformations: {
            height: {type: Number, default: VIDEO_DIMENSIONS?.height},
            width: {type: Number, default: VIDEO_DIMENSIONS?.width},
            quality: {type: Number, min:1, max: 100}
        }

    },
    {
        timestamps: true,
    }
)

// Ensure schema updates take effect during dev HMR
if ((mongoose.models as any).Video) {
  delete (mongoose.models as any).Video
}

const Video = models?.Video || model<IVideo>("Video", VideoSchema)

export default Video