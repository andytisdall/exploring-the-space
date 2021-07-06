import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import AuthControl from './AuthControl';
import AddButton from './AddButton';
import { createPlaylistSong, editPlaylistSong } from '../actions';

const PlaylistSong = ({ song, playlistsongs, playlistId, playlists, bands }) => {

    const { currentBand } = bands;

    const playlist = playlists[playlistId];

    const otherSongs = playlistsongs.map(s => playlist.songs.includes(s.id));

    const addSubmit = formValues => {
        createPlaylistSong(formValues);
    }

    const editSubmit = formValues => {
        editPlaylistSong(formValues);
    }


    const displayDate = moment.utc(song.bounce.date).format('MM/DD/YY');
    const minutes = Math.floor(song.bounce.duration / 60);
    const seconds = Math.floor(song.bounce.duration % 60) < 10 ? '0' + Math.floor(song.bounce.duration % 60) : Math.floor(song.bounce.duration % 60);
    const displayTime = `${minutes}:${seconds}`

    return (
        <div className='title-margin'>
            <div class="title">                    
                <div className="marqee">
                    <div className='row-name'>
                        <div className="song-position">{song.position}</div>
                        <div className='name-spot'>
                            <h3>{song.title.title}</h3>
                        </div>
                    </div>      

                    <div className='playcontainer'>                                   
                        <div className='songtime'>{displayTime}</div>
                        <div class='playbutton'>
                            <img src='/images/play.svg' class='playicon' />
                        </div>
                        <div class='title-display'>
                            <p>{song.version.name}</p>
                            <p>{displayDate}</p>
                        </div>
                    </div>

                    <AuthControl>
                        <div className='tier-display'>
                            <AddButton 
                                onSubmit={addSubmit}
                                title='Add to Playlist'
                                image='/images/playlist.png'
                                fields={[
                                    {
                                        label: 'Playlist',
                                        name: 'playlistId',
                                        type: 'select',
                                        options: currentBand.playlists.map(pl => {
                                                return { value: pl.id, display :pl.name };
                                        })
                                    }
                                ]}
                            />
                
                            <AddButton
                                image='/images/edit.png'
                                title={`Edit ${song.title.title}`}
                                onSubmit={editSubmit}
                                fields={[
                                    {
                                        name: 'newPosition',
                                        label: 'Position',
                                        type: 'select',
                                        options: otherSongs.map(s => {
                                            return { value: s.position, display: s.position };
                                        })
                                    },
                                    {
                                        name: 'newBounce',
                                        label: 'Bounce',
                                        type: 'select',
                                        options: song.title.versions.map(v => {
                                            return { value: v.id, display: moment.utc(v.date).format('MM/DD/YY') }
                                        })
                                    }
                                ]}
                            />
                            {/* <DeleteButton /> */}
                        </div>
                    </AuthControl>
                    
                </div>
            </div>
        </div>
    );

};



const mapStateToProps = state => {

    return {
        playlistsongs: state.playlistsongs,
        bands: state.bands,
        playlists: state.playlists
    }

}

export default connect(mapStateToProps)(PlaylistSong);