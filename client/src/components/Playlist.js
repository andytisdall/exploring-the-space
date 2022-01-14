import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { fetchPlaylistSongs, deletePlaylist, editPlaylist } from '../actions';
import PlaylistSong from './PlaylistSong';
import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import requireAuth from './requireAuth';

const Playlist = ({ playlist, playlists, fetchPlaylistSongs, playlistSongs, authorized, editPlaylist, deletePlaylist, band }) => {

    const [expand, setExpand] = useState(false);
    const [playlistList, setPlaylistList] = useState([]);
    const [times, setTimes] = useState({});
    const [songsToRender, setSongsToRender] = useState(null);
    const [doUpdate, setDoUpdate] = useState(false);


    useEffect(() => {
        fetchPlaylistSongs(playlist.id);
    }, []);

    useEffect(() => {
        setSongsToRender(playlist.songs.map(id => playlistSongs[id]));
    }, [playlistSongs, playlist.songs]);

    const renderPlaylistSongs = () => {

        songsToRender.sort((a, b) => a.position < b.position ? -1 : 1);

        return songsToRender.map(song => {
            if (song) {
                return (
                <PlaylistSong song={song} playlist={playlist} key={song.id} getTime={getTime} doUpdate={doUpdate} />
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

    useEffect(() => {
        if (doUpdate) {
            setDoUpdate(false);
        }
    }, [doUpdate]);

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
                    addClass='add-tier'
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

    const renderTotalTime = () => {


        const total = Object.values(times).reduce((prev, cur) => {
            return prev + cur;
        }, 0);

        if (!total) {
            return null;
        }

        const minutes = Math.floor(total / 60);
        const seconds = Math.floor(total % 60) < 10 ? '0' + Math.floor(total % 60) : Math.floor(total % 60);
        return (
            <div>
                {`${minutes}:${seconds}`}
            </div>
        );
    };

    const getTime = (track) => {
        if (times[track.id] !== track.duration) {
            setTimes({ ...times, [track.id]: track.duration });
        }
    };

    const showUpdatePlaylistCheckbox = () => {
        if (authorized && expand) {
            return (
                <div className="playlist-update">
                    <div>
                        Set all to current
                    </div>
                    <div
                        className="playlist-update-btn"
                        onClick={e => {
                            e.stopPropagation();
                            setDoUpdate(true);
                        }}
                    />
                </div>
            );
        }
    };


    const arrow = expand ? 'down-arrow' : '';
    const open = expand ? 'open' : 'closed';

    return (
        <>
            <div className={`row tier ${expand ? 'row-open' : ''}`} onClick={() => setExpand(!expand)} >
                <div className="marqee tier-info">
                    <div className="tier-name"  >
                        <img className={`arrow ${arrow}`} src={`/images/right-arrow.svg`}/>
                        <h2>{playlist.name}</h2>

                        {showUpdatePlaylistCheckbox()}

                    </div>

                    <div className="tier-count">
                        <div className="song-count">{playlist.songs.length} songs</div>
                        <div className="song-count">{renderTotalTime()}</div>
                    </div>
                    <div className="tier-display">
                            {renderEditButton()}
                            {renderDeleteButton()}
                    </div>
                </div>   
            </div>
            <hr />
            <div className={`title-container ${open}`}>
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

export default connect(mapStateToProps, { fetchPlaylistSongs, deletePlaylist, editPlaylist })(requireAuth(Playlist));