import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import fileDownload from 'js-file-download';
import axios from 'axios';

import { queueSongs, queuePlaylistSongs, playAudio } from '../actions';


const PlayContainer = ({ song, queueSongs, parentType, queuePlaylistSongs }) => {

    const displayDate = (date) => {
        return moment.utc(date).format('MM/DD/YY');
    }

    const displayTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60) < 10 ? '0' + Math.floor(time % 60) : Math.floor(time % 60);
        return `${minutes}:${seconds}`;
    }

    const onPlay = (e) => {
        e.stopPropagation();
        if (parentType === "tier") {
            queueSongs(song);
        } else if (parentType === "playlist") {
            queuePlaylistSongs(song);
        }
    };

    const handleDownload = (id, filename) => {
        let baseUrl;
        if (process.env.NODE_ENV === 'production') {
            baseUrl = 'https://exploring-the-space.com'
        } else {
            baseUrl = 'http://localhost:3001';
        }
        axios.get(`${baseUrl}/api/audio/download/${id}.mp3`, {
            responseType: 'blob'
        })
        .then(res => {
            fileDownload(res.data, filename);
        });
    };




    return (
        <div className='playcontainer'>
            <div className='songtime'>{displayTime(song.bounce.duration)}</div>
            <div className='playbutton'>
                <img
                    src='/images/play.svg' className='playicon'
                    onClick={onPlay}
                />
            </div>
            <div className='title-display'>
                <p>{song.version.name}</p>
                <p>{displayDate(song.bounce.date)}</p>
            </div>
            <div
                className='download'
                onClick={e => {
                    e.stopPropagation();
                    handleDownload(song.bounce.id, `${song.title.title}-${moment.utc(song.bounce.date).format('MM-DD-yy')}.mp3`);
                }}
            >
                <img src="/images/download.svg" />
            </div>
        </div>
    );
};

export default connect(null, { queueSongs, queuePlaylistSongs, playAudio })(PlayContainer);
