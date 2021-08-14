import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import AddButton from './AddButton';
import { createPlaylistSong, editPlaylistSong } from '../actions';
import PlayContainer from './PlayContainer';

const PlaylistSong = ({ playlist, song, playlistSongs, playlists, bands }) => {

    // const { currentBand } = bands;

    // const playlist = playlists[playlistId];

    // const otherSongs = playlistSongs.filter(s => playlist.songs.includes(s.id));

    const addSubmit = formValues => {
        createPlaylistSong(formValues);
    }

    const editSubmit = formValues => {
        editPlaylistSong(formValues);
    }
    
    const playSong = s => {
        return {
            playlist,
            title: s.title,
            version: s.version,
            bounce: s.bounce,
            self: s
        };
    };

    const renderPlayContainer = () => {

        if (song) {
            return <PlayContainer song={playSong(song)} parentType="playlist" />;
        }
    }



    return (
        <div className='title-margin'>
            <div className="title">                    
                <div className="marqee">
                    <div className='row-name'>
                        <div className="song-position">{song.position}</div>
                        <div className='name-spot'>
                            <h3>{song.title.title}</h3>
                        </div>
                    </div>      

                    {renderPlayContainer()}

                
                    {/* <div className='tier-display'>
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
                    </div> */}
     
                </div>
            </div>
        </div>
    );

};



const mapStateToProps = state => {

    return {
        playlistSongs: state.playlistSongs,
        bands: state.bands,
        playlists: state.playlists
    }

}

export default connect(mapStateToProps)(PlaylistSong);