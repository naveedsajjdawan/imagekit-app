import mongoose,{Schema, model, models} from "mongoose"
import bcrypt from 'bcrypt'

export interface Iuser {
    email: string;
    password: string;
    name?: string;
    avatarUrl?: string;
    passwordRequiresReset?: boolean;
    resetPasswordToken?: string | null;
    resetPasswordExpires?: Date | null;
    _id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<Iuser>(
    {
    email: {type: String, required: true, unique: true },
    password:{type: String, required: true},
    name: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    passwordRequiresReset: { type: Boolean, default: false },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    },
    {
        timestamps: true,
    },
)

userSchema.pre('save',async function(next){
    if(this.isModified("password"))
    {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
})

// Ensure schema updates take effect during dev HMR
if ((mongoose.models as any).User) {
  delete (mongoose.models as any).User
}

const User = models?.User || model<Iuser>("User", userSchema)

export default User