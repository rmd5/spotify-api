import mongoose, { Schema, Document } from 'mongoose';

export interface SavedModel extends Document {
    date: Date,
    user_id: String,
    album_id: String,
    daily_jam: Boolean
}

const SavedSchema: Schema = new Schema({
    date: { type: Date, default: Date.now },
    user_id: String,
    album_id: String,
    daily_jam: Boolean
});

export default mongoose.model<SavedModel>('Saved', SavedSchema);