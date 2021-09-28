import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';

import { queueSongs, queuePlaylistSongs, playAudio, throwError } from '../actions';


const PlayContainer = ({ song, queueSongs, parentType, queuePlaylistSongs, throwError }) => {

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


    let baseUrl;
    if (process.env.NODE_ENV === 'production') {
        baseUrl = 'https://exploring-the-space.com'
    } else {
        baseUrl = 'http://localhost:3001';
    }

    return (
        <div className='play-container'>
            <div className='play-container-time'>{displayTime(song.bounce.duration)}</div>           
            <img
                src='/images/play.svg' className='play-icon'
                onClick={onPlay}
            /> 
            <div className='play-container-display'>
                <p>{song.version.name}</p>
                <p>{displayDate(song.bounce.date)}</p>
            </div>
            <a
                className='download'
                onClick={e => e.stopPropagation()}
                href={`${baseUrl}/api/audio/download/${song.bounce.id}/${encodeURIComponent(song.title.title)}`}
                download
            >
                <img src="/images/download.svg" />
            </a>
        </div>
    );
};

export default connect(null, { queueSongs, queuePlaylistSongs, playAudio, throwError })(PlayContainer);
