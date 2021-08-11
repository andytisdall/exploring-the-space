import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchPlaylistSongs } from '../actions';

import PlaylistSong from './PlaylistSong';
import AddButton from './AddButton';

const Playlist = ({ playlist, fetchPlaylistSongs, playlistsongs }) => {

    useEffect(() => {
        fetchPlaylistSongs(playlist.id);
    }, []);

    const renderPlaylistSongs = () => {

        const songsToRender = playlist.songs.map(id => playlistsongs[id]);

        return songsToRender.map(song => {
            return (
                <PlaylistSong song={song} />
            );
        });
    }

    return (
        <>
            <div className="row tier">
                <div className="marqee tier-info">
                    <div className="tier-name">
                        <img className="arrow" src="right-arrow.svg" />
                        <h2>{playlist.name}</h2>
                    </div>
                    <div className="tier-count">
                            {/* <AddButton title = 'Add a Song' /> */}
                        <div className="song-count">{playlist.songs.length} songs</div>
                        <div className="song-count">{playlist.totalTime}</div>
                    </div>
                    <div className="tier-display">

                            {/* <AddButton /> */}
               
                    </div>
                </div>
            </div>
            {renderPlaylistSongs()}
        </>
    );
};

const mapStateToProps = state => {
    return {
        playlistsongs: state.playlistsongs
    }
}

export default connect(mapStateToProps, { fetchPlaylistSongs })(Playlist);