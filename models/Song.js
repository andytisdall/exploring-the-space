const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now() },
    latest: { type: Boolean, default: false },
    comments: String,
    mp3: String,
    length: Number
});

const versionSchema = new mongoose.Schema({
    name: { type: String },
    current: { type: Boolean, default: true },
    notes: String,
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song'}]
});

const titleSchema = new mongoose.Schema({
    title: { type: String, unique: true },
    versions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Version'}],
});

const tierSchema = new mongoose.Schema({
    name: String,
    trackList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Title'}],
    position: Number
});


mongoose.model('Tier', tierSchema);
mongoose.model('Title', titleSchema);
mongoose.model('Version', versionSchema);
mongoose.model('Song', songSchema);