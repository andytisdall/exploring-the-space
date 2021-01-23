const mongoose = require('mongoose');
const { Readable } = require('stream');
let bucket;

mongoose.connection.on('connected', () => {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        chunkSizeBytes: 1024,
        bucketName: 'mp3s'
    });
});


exports.addMp3 = (file) => {

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



};

exports.getMp3 = (mp3Id) => {
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

};

exports.deleteMp3 = (mp3Id) => {
    
    bucket.delete(mp3Id, (err) => {
        if (err) {
            return err;
        } else {
            console.log('mp3 deleted');
            return;
        }
    });


};

