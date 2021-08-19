import mongoose from 'mongoose';


const bandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    tiers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tier'}],
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist'}]
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            }
        }
    }
);



const Band =  mongoose.model('Band', bandSchema);

export { Band };