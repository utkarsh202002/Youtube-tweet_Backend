import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

import  Jwt  from 'jsonwebtoken';

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    avatar: {
        type: String, // cloudinary url
        required: true
    },
    coverImage: {
        type: String // cloudinary url
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: 'Video'
    }],
    password: {
        type: String,
        required: [true, 'password is required']
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true }); // Corrected 'timstamps' to 'timestamps'

// Adding the pre-save hook
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});

// Adding a method to the schema
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

//generating accessToken

userSchema.methods.generateAccessToken=function(){
    return Jwt.sign({
        _id:this._id,
        username:this.username,
        email:this.email,
        fullName:this.fullName

    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
    

}

userSchema.methods.generateRefreshToken=function(next){
    return Jwt.sign({
        _id:this._id,
        

    },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
    

}



// Creating the model
export const User = mongoose.model('User', userSchema);

