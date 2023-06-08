import mongoose, { Schema, Document } from 'mongoose';

export interface SavedModel extends Document {
    date: Date,
    user_id: String,
    spotify_id: String,
    href: String,
    raw: any,
    color: string,
    other_albums: any,
    similar_artists: any
}

const SavedSchema: Schema = new Schema({
    date: { type: Date, default: Date.now },
    user_id: String,
    spotify_id: String,
    href: String,
    raw: Object,
    color: String,
    other_albums: Object,
    similar_artists: Object
});

export default mongoose.model<SavedModel>('Saved', SavedSchema);