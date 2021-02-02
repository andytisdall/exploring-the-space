import mongoose from 'mongoose';
import { Readable } from 'stream';
let bucket;

mongoose.connection.on('connected', () => {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        chunkSizeBytes: 1024,
        bucketName: 'mp3s'
    });
});


export function addMp3(file) {

    // const readableMp3Stream = new Readable();
    // readableMp3Stream.push(file.buffer);
    // readableMp3Stream.push(null);




    let uploadStream = bucket.openUploadStream(file.name);

    let id = uploadStream.id;

    const readableStream = new Readable();
    readableStream.push(file.data);
    readableStream.push(null);
    readableStream.pipe(uploadStream);

    return uploadStream;



}

export function getMp3(mp3Id) {
    let stream;
    try {
        // console.log('looking for mp3');
        stream = bucket.openDownloadStream(mp3Id);
        stream.on('error', (err) => {
            console.log('cannot find mp3');
            return;
        });
    } catch (err) {
        return (err);
    }
    return stream;

}

export function deleteMp3(mp3Id) {
    
    bucket.delete(mp3Id, (err) => {
        if (err) {
            return err;
        } else {
            console.log('mp3 deleted');
            return;
        }
    });


}

