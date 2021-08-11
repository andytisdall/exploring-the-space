import mongoose from 'mongoose';
import { Password } from '../services/password.js';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: { 
        type: String,
        required: true
    },
    bands: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Band'}]
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
            }
        }
    }
);

userSchema.pre('save', async function(done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

const User =  mongoose.model('User', userSchema);

export { User };