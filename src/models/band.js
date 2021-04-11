import mongoose from 'mongoose';


const bandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    tiers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tier'}],
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist'}]
});



const Band =  mongoose.model('Band', bandSchema);

export { Band };