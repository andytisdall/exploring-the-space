import React from 'react';

import PlaylistSong from './PlaylistSong';

const Playlist = props => {

    const renderPlaylistSongs = () => {
        return props.playlistsongs.map(song => {
            return (
                <PlaylistSong />
            );
        });
    }

    return (
        <>
            <div className="row tier">
                <div className="marqee tier-info">
                    <div className="tier-name">
                        <img className="arrow" src="right-arrow.svg" />
                        <h2>{tier.name}</h2>
                    </div>
                    <div className="tier-count">
                        <AuthControl>
                            <AddButton title = 'Add a Song' />
                        </AuthControl>
                        <div className="song-count">{tier.tracklist.length} songs</div>
                        <div className="song-count">{tier.totalTime}</div>
                    </div>
                    <div className="tier-display">
                        <AuthControl>
                            <AddButton title={`Edit ${tier.name}`} />
                            <DeleteButton />
                        </AuthControl>
                    </div>
                </div>
            </div>
            {renderPlaylistSongs()}
        </>
    );
};

export default Playlist;