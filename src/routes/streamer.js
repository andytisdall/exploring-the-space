import mongoose from 'mongoose';
import { Readable } from 'stream';
import mongodb from 'mongodb';

const Song = mongoose.model('Song');

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

export async function playMp3(req,res) {

    const id = req.params.id.split('.')[0];
    const thisSong = await Song.findOne({ _id: id });
    let mp3Id = new mongodb.ObjectID(thisSong.mp3);

    // fix so that safari can request ranges of the file

    if (req.headers.range) {
        const parts = req.headers.range.replace(/bytes=/, "").split("-");
        const partialstart = parts[0];
        const partialend = parts[1];
        const start = parseInt(partialstart, 10);
        const end = parseInt(partialend, 10);
        const chunksize = (end - start) + 1;

        // chrome sends a range request as bytes=0-
        if (!partialend) {
            
            const stream = bucket.openDownloadStream(mp3Id);
            stream.on('error', (err) => {
                console.log('cannot find mp3');
                return;
            });
    
            res.set({
                'Accept-Ranges': 'bytes',
                'Content-Length': thisSong.length,
                'Content-Type': 'audio/mpeg',
                'Content-Range': 'bytes ' + start + '-' + end + '/' + thisSong.length,
            });
            stream.pipe(res);
        
        // safari sends a range request of bytes=0-1 and then one for bytes=0-(end of file)
        } else if (chunksize === thisSong.length) {
            const stream = bucket.openDownloadStream(mp3Id);


            // read the whole stream to an array and then send the buffer with the response for safari
            let file = [];
            stream.on('data', (chunk) => {
                file.push(chunk);
    
            });

            stream.on('end', () => {
                file = Buffer.concat(file);
                res.send(file);
            })

            res.status(206).set({
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Range': 'bytes ' + start + '-' + end + '/' + thisSong.length,
                'Content-Type': 'audio/mpeg',
                
            });
        
        } else {

            //for the initial safari request
            const stream = bucket.openDownloadStream(mp3Id, { start, end: end -1 });
            res.status(206).set({
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Range': 'bytes ' + start + '-' + end + '/' + thisSong.length,
                'Content-Type': 'audio/mpeg',
            });
            stream.pipe(res);
        // } else if (start === thisSong.length-2 && end === thisSong.length -1) {
        //     console.log('requesting last 2 bytes');
        //     const stream = bucket.openDownloadStream(mp3Id, { start, end: end -1 });
        //     res.status(206).set({
        //         'Accept-Ranges': 'bytes',
        //         'Content-Length': chunksize,
        //         'Content-Range': 'bytes ' + start + '-' + end + '/' + thisSong.length,
        //         'Content-Type': 'audio/mpeg',
        //         // 'Transfer-Encoding': 'chunked'
        //     });

        //     let file = [];
        //     stream.on('data', (chunk) => {
        //         file.push(chunk);
    
        //     });

        //     stream.on('end', () => {
        //         const bytes = new Uint8Array.from(Buffer.from(file));
        //         res.send(Buffer.concat([bytes[-2], bytes[-1]]));
        //     });

        //     stream.on('error', (err) => {
        //         console.log('cannot find mp3');
        //         res.end();
        //     });
    
            
        //     stream.pipe(res);
            // let file = [];
            // stream.on('data', (chunk) => {
            //     file.push(chunk);
    
            // });

            // stream.on('error', (err) => {
            //     console.log('cannot find mp3');
            //     return;
            // });

            // stream.on('end', () => {
            //     file = Buffer.concat(file);
            //     res.send(file);
            // })
        }

    } 
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

