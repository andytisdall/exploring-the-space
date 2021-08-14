import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchPlaylistSongs } from '../actions';

import PlaylistSong from './PlaylistSong';
import AddButton from './AddButton';

const Playlist = ({ playlist, fetchPlaylistSongs, playlistSongs }) => {

    const [expand, setExpand] = useState(false);

    const arrow = expand ? 'down' : 'right';

    useEffect(() => {
        fetchPlaylistSongs(playlist.id);
    }, []);

    const renderPlaylistSongs = () => {

        const songsToRender = playlist.songs.map(id => playlistSongs[id]);

        return songsToRender.map(song => {
            if (song) {
                return (
                <PlaylistSong song={song} playlist={playlist} key={playlist.id} />
                );
            }
        });
    }

    return (
        <>
            <div className="row tier" onClick={() => setExpand(!expand)} >
                <div className="marqee tier-info">
                    <div className="tier-name"  >
                        <img className="arrow" src={`/images/${arrow}-arrow.svg`}/>
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
                <hr />
            </div>
            <div className="titlecontainer">
                {expand && renderPlaylistSongs()}
            </div>
        </>
    );
};

const mapStateToProps = state => {
    return {
        playlistSongs: state.playlistSongs
    }
}

export default connect(mapStateToProps, { fetchPlaylistSongs })(Playlist);