import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const songSchema = new Schema(
  {
    date: { type: Date, default: Date.now() },
    latest: { type: Boolean, default: false },
    comments: String,
    mp3: String,
    size: Number,
    duration: Number,
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const versionSchema = new Schema(
  {
    name: { type: String },
    current: { type: Boolean, default: false },
    notes: String,
    songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        ret.bounces = ret.songs;
        delete ret._id;
        delete ret.songs;
      },
    },
  }
);

const titleSchema = new Schema(
  {
    title: { type: String },
    versions: [{ type: Schema.Types.ObjectId, ref: 'Version' }],
    chords: { type: String },
    selectedVersion: { type: Schema.Types.ObjectId, ref: 'Version' },
    selectedBounce: { type: Schema.Types.ObjectId, ref: 'Song' },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const tierSchema = new Schema(
  {
    name: String,
    trackList: [{ type: Schema.Types.ObjectId, ref: 'Title' }],
    position: Number,
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const playlistSongSchema = new Schema(
  {
    title: { type: Schema.Types.ObjectId, ref: 'Title' },
    version: { type: Schema.Types.ObjectId, ref: 'Version' },
    position: Number,
    bounce: { type: Schema.Types.ObjectId, ref: 'Song' },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const playlistSchema = new Schema(
  {
    name: { type: String },
    position: Number,
    songs: [{ type: Schema.Types.ObjectId, ref: 'PlaylistSong' }],
    notes: String,
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const Tier = mongoose.model('Tier', tierSchema);
const Title = mongoose.model('Title', titleSchema);
const Version = mongoose.model('Version', versionSchema);
const Song = mongoose.model('Song', songSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);
const PlaylistSong = mongoose.model('PlaylistSong', playlistSongSchema);

export { Playlist, PlaylistSong, Title, Version, Tier, Song };
