import mongoose, { Schema, Document } from 'mongoose';

export interface AlbumModel extends Document {
    date: Date,
    spotify_id: String,
    href: String,
    raw: any
}

const AlbumSchema: Schema = new Schema({
    date: { type: Date, default: Date.now },
    spotify_id: String,
    href: String,
    raw: Object
});

export default mongoose.model<AlbumModel>('Album', AlbumSchema);