// const fs = require('fs');
const mongoose = require('mongoose');
const { Readable } = require('stream');
const ObjectID = require('mongodb').ObjectID;
const streamifier = require('streamifier');

exports.addMp3 = async (file) => {

    // const readableMp3Stream = new Readable();
    // readableMp3Stream.push(file.buffer);
    // readableMp3Stream.push(null);


    const gridfsbucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        chunkSizeBytes: 1024,
        bucketName: 'mp3s'
    });

    let uploadStream = gridfsbucket.openUploadStream(file.name);

    let id = uploadStream.id;

    const readableStream = new Readable();
    readableStream.push(file.data);
    readableStream.push(null);
    readableStream.pipe(uploadStream);

    // let stream = streamifier.createReadStream(file.data).pipe(uploadStream);

    uploadStream.on('error', (err) => {
            console.log(err);
    })
    
    uploadStream.on('finish', () => {
            console.log('uploaded');
    });

    return id;

};

exports.getMp3 = (id) => {

    let mp3Id = new ObjectID(id);

    const gridfsbucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        chunkSizeBytes: 1024,
        bucketName: 'mp3s'
    });

    const stream = gridfsbucket.openDownloadStream(mp3Id);

    // const streamify = streamifier.createReadStream(stream);

    // const writable = Writable;

    // stream.pipe(writable);

    return stream;


};


