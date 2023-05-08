import mongoose, { Schema, Document } from 'mongoose';

export interface UserModel extends Document {
    joined: Date,
    display_name: String,
    external_urls: Object,
    followers: Object,
    href: String,
    spotify_id: String,
    images: Object[],
    type: String,
    uri: String,
    token: String
}

const UserSchema: Schema = new Schema({
    joined: { type: Date, default: Date.now },
    display_name: String,
    external_urls: Object,
    followers: Object,
    href: String,
    spotify_id: String,
    images: Object,
    type: String,
    uri: String,
    token: String
});

export default mongoose.model<UserModel>('User', UserSchema);