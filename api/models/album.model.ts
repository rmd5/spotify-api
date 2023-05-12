import mongoose, { Schema, Document } from 'mongoose';

export interface AlbumModel extends Document {
    date: Date,
    spotify_id: String,
    href: String,
    raw: any,
    color: string,
    other_albums: any,
    similar_artists: any
}

const AlbumSchema: Schema = new Schema({
    date: { type: Date, default: Date.now },
    spotify_id: String,
    href: String,
    raw: Object,
    color: String,
    other_albums: Object,
    similar_artists: Object
});

export default mongoose.model<AlbumModel>('Album', AlbumSchema);