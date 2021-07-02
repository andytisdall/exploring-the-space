import React from 'react';

const AudioPlayer = ({ mp3Id }) => {
    return (
        <audio src={`/audio/${mp3Id}.mp3`} className='player' id={`${mp3Id}`} />
    );
};

export default AudioPlayer;