import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';

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

    const onPlay = () => {
        if (parentType === "tier") {
            queueSongs(song);
        } else if (parentType === "playlist") {
            queuePlaylistSongs(song);
        }
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
        </div>
    );
};

export default connect(null, { queueSongs, queuePlaylistSongs, playAudio })(PlayContainer);
