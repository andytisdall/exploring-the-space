import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { fetchPlaylistSongs, deletePlaylist, editPlaylist } from '../actions';
import PlaylistSong from './PlaylistSong';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import requireAuth from './requireAuth';

const Playlist = ({ playlist, playlists, fetchPlaylistSongs, playlistSongs, authorized, deletePlaylist, band }) => {

    const [expand, setExpand] = useState(false);
    const [playlistList, setPlaylistList] = useState([]);

    const [songsToRender, setSongsToRender] = useState(null);

    const arrow = expand ? 'down' : 'right';

    useEffect(() => {
        fetchPlaylistSongs(playlist.id);
    }, []);

    useEffect(() => {
        setSongsToRender(playlist.songs.map(id => playlistSongs[id]));
    }, [playlistSongs, playlist.songs]);

    const renderPlaylistSongs = () => {

        songsToRender.sort((a, b) => {
            if (a.position < b.position) {
                return -1;
            }
            if (b.position < a.position) {
                return 1;
            }
        })

        return songsToRender.map(song => {
            if (song) {
                return (
                <PlaylistSong song={song} playlist={playlist} key={song.id} />
                );
            }
        });
    };

    useEffect(() => {
        if (band.playlists.length) {
            const playlistsToShow = band.playlists.map(id => playlists[id]).sort((a, b) => {
                if (a.position < b.position) {
                    return -1;
                }
                if (b.position < a.position) {
                    return 1;
                }
            });
            setPlaylistList(playlistsToShow.map(t => {
                if (t) {
                    return { value: t.position, display: t.position };
                }
            }));
        }
    }, [playlists]);

    const renderEditButton = () => {
        if (authorized) {

            return (
                <AddButton
                    title={`Edit ${playlist.name}`}
                    image="images/edit.png"
                    fields={[
                        {
                            label: 'Playlist Name',
                            name: 'name',
                            type: 'input',          
                        }, {
                            label: 'Playlist Position',
                            name: 'position',
                            type: 'select',
                            options: playlistList,
                        }
                    ]}
                    onSubmit={(formValues) => editPlaylist(formValues, playlist.id)}
                    initialValues={_.pick(playlist, 'name', 'position')}
                    form={`edit-${playlist.id}`}
                    enableReinitialize={true}
                />
            );
        }
    };

    const renderDeleteButton = () => {
        if (authorized) {
            return (
                <DeleteButton
                    onSubmit={() => deletePlaylist(playlist.id)}
                    displayName={playlist.name}
                />
            );
        }
    };

    return (
        <>
            <div className="row tier" onClick={() => setExpand(!expand)} >
                <div className="marqee tier-info">
                    <div className="tier-name"  >
                        <img className="arrow" src={`/images/${arrow}-arrow.svg`}/>
                        <h2>{playlist.name}</h2>
                    </div>
                    <div className="tier-count">
                        <div className="song-count">{playlist.songs.length} songs</div>
                        {/* <div className="song-count">{playlist.totalTime}</div> */}
                    </div>
                    <div className="tier-display">
                            {renderEditButton()}
                            {renderDeleteButton()}
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
        playlists: state.playlists,
        playlistSongs: state.playlistSongs,
        band: state.bands.currentBand
    }
}

export default connect(mapStateToProps, { fetchPlaylistSongs, deletePlaylist })(requireAuth(Playlist));