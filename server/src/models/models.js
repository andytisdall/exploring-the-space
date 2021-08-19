import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const songSchema = new Schema({
    date: { type: Date, default: Date.now() },
    latest: { type: Boolean, default: false },
    comments: String,
    mp3: String,
    size: Number,
    duration: Number
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            }
        }
    }
);

const versionSchema = new Schema({
    name: { type: String },
    current: { type: Boolean, default: false },
    notes: String,
    songs: [{ type: Schema.Types.ObjectId, ref: 'Song'}]
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            ret.bounces = ret.songs;
            delete ret._id;
            }
        }
    }
);

const titleSchema = new Schema({
    title: { type: String, unique: true },
    versions: [{ type: Schema.Types.ObjectId, ref: 'Version'}],
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            }
        }
    }
);

const tierSchema = new Schema({
    name: String,
    trackList: [{ type: Schema.Types.ObjectId, ref: 'Title'}],
    position: Number
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            }
        }
    }
);

const playlistSongSchema = new Schema({
    title: { type: Schema.Types.ObjectId, ref: 'Title'},
    version: { type: Schema.Types.ObjectId, ref: 'Version'},
    position: Number,
    bounce: { type: Schema.Types.ObjectId, ref: 'Song'}
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            }
        }
    }
);

const playlistSchema = new Schema({
    name: { type: String, unique: true },
    position: Number,
    songs: [{ type: Schema.Types.ObjectId, ref: 'PlaylistSong'}],
    notes: String
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            }
        }
    }
);


mongoose.model('Tier', tierSchema);
mongoose.model('Title', titleSchema);
mongoose.model('Version', versionSchema);
mongoose.model('Song', songSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);
const PlaylistSong = mongoose.model('PlaylistSong', playlistSongSchema);

export { Playlist, PlaylistSong };