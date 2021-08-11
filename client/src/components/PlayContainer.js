import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';

import { queueSongs, playAudio } from '../actions';

const PlayContainer = ({ song, queueSongs, playAudio }) => {

    if (!song) {
        return null;
    }

    const displayDate = moment.utc(song.bounce.date).format('MM/DD/YY');

    const minutes = Math.floor(song.bounce.duration / 60)
    const seconds = Math.floor(song.bounce.duration % 60) < 10 ? '0' + Math.floor(song.bounce.duration % 60) : Math.floor(song.bounce.duration % 60)
    const displayTime = `${minutes}:${seconds}`;

    const onPlay = () => {
        queueSongs(song);
        // const firstSong = {
        //     title: song.title.title,
        //     version: song.version.name,
        //     date: song.bounce.date,
        //     duration: song.bounce.duration,
        //     audio: song.bounce.mp3
        // };
    };


    return (
        <div className='playcontainer'>
            <div className='songtime'>{displayTime}</div>
            <div className='playbutton'>
                <img
                    src='/images/play.svg' className='playicon'
                    onClick={onPlay}
                />
            </div>
            <div className='title-display'>
                <p>{song.version.name}</p>
                <p>{displayDate}</p>
            </div>
        </div>
    );
};

export default connect(null, { queueSongs, playAudio })(PlayContainer);
