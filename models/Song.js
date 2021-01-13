const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now(), unique: true },
    latest: { type: Boolean, default: false },
    file: Buffer,
    comments: String,
});

const versionSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    current: { type: Boolean, default: true },
    versionNotes: String,
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song'}]
});

const titleSchema = new mongoose.Schema({
    title: { type: String, unique: true },
    versions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Version'}],
});

const tierSchema = new mongoose.Schema({
    name: String,
    trackList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Title'}]
});

mongoose.model('Tier', tierSchema);
mongoose.model('Title', titleSchema);
mongoose.model('Version', versionSchema);
mongoose.model('Song', songSchema);