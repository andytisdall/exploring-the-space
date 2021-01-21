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

    uploadStream.on('error', (err) => {
            console.log(err);
    })
    
    uploadStream.on('finish', () => {
            console.log('uploaded');
    });

    return id;

};

exports.getMp3 = (mp3Id) => {

    try {
        const stream = bucket.openDownloadStream(mp3Id);
        return stream;
    } catch (err) {
        return (err);
    }

};

exports.deleteMp3 = (mp3Id) => {
    
    try {
        bucket.delete(mp3Id);
    } catch (err) {
        console.log(err.message);
    }

};

