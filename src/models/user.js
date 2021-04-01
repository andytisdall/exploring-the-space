import mongoose from 'mongoose';
import { Password } from '../services/password.js';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: { 
        type: String,
        required: true
    }
});

userSchema.pre('save', async function(done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

const User =  mongoose.model('User', userSchema);

export { User };