import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';

import AddButton from './AddButton';
import DeleteButton from './DeleteButton';
import { editPlaylistSong, fetchVersions, fetchBounces, deletePlaylistSong } from '../actions';
import PlayContainer from './PlayContainer';
import requireAuth from './requireAuth';

const PlaylistSong = ({ playlist, song, playlistSongs, authorized, versions, bounces, titles, fetchBounces, fetchVersions, editPlaylistSong, deletePlaylistSong, audio, getTime }) => {

    const [playSong, setPlaySong] = useState(null);

    useEffect(() => {
        fetchVersions(song.title);
        titles[song.title].versions.forEach(id => {
            fetchBounces(id);
        });
    }, []);
    
    useEffect(() => {
        if (titles[song.title]) {
            setPlaySong({
                    playlist,
                    title: titles[song.title],
                    version: versions[song.version],
                    bounce: bounces[song.bounce],
                    position: song.position
                });
            }
            if (bounces[song.bounce]) {
                getTime({ id: song.id, duration: bounces[song.bounce].duration });
            }   
    }, [playlistSongs[song.id], bounces[song.bounce], titles[song.title], versions[song.version]]);

    const renderPlayContainer = () => {

        if (playSong && playSong.bounce && playSong.version) {
            return <PlayContainer song={playSong} parentType="playlist" />;
        } else {
            return (
                <div className="playlistsong-no-bounce">
                    <p>
                        {versions[song.version] ? `${versions[song.version].name}` : 'No Version Selected'}
                    </p>
                    <p>
                        No Bounce Selected
                    </p>
                </div>
            );
        }
    };

    const onEditSubmit = formValues => {
        const thisVersion = Object.values(versions).find(v => v.bounces.includes(formValues.bounce));
        editPlaylistSong({
            ...formValues,
            version: thisVersion.id,
            playlistId: playlist.id
        }, song.id);
    };

    const renderEditButton = () => {
        if (authorized && titles[song.title]) {

            const otherSongs = Object.values(playlistSongs)
                .filter(s => playlist.songs.includes(s.id))
                .sort((a,b) => a.position < b.position ? -1 : 1)
                .map(s => {
                    return { value: s.position, display: s.position };
            });

            const thisTitle = titles[song.title];

            const otherVersions = thisTitle.versions.map(id => versions[id]);

            const otherBounces = otherVersions.map(v => {
                if (v) {
                    return v.bounces.map(id => bounces[id]);
                }
            });


            const editOptions = [];
            
            otherVersions.forEach((v, i) => {
                if (otherBounces[i]) {
                    otherBounces[i].forEach(b => {
                        if (b) {
                            let current = '';
                            if (v.current && b.latest) {
                                current =' * current';
                            }
                            editOptions.push({
                                value: b.id,
                                display: `${v.name} -- ${moment.utc(b.date).format('MM/DD/YY')}${current}`
                            });
                        }
                    });
                }
            });

            return (
                <AddButton
                    image='/images/edit.png'
                    title={`Edit ${titles[song.title].title}`}
                    onSubmit={formValues => onEditSubmit(formValues)}
                    fields={[
                        {
                            name: 'position',
                            label: 'Position',
                            type: 'select',
                            options: otherSongs
                        },
                        {
                            name: 'bounce',
                            label: 'Bounce',
                            type: 'select',
                            options: editOptions,
                            required: true
                        }
                    ]}
                    initialValues={song.bounce ? _.pick(song, 'position', 'bounce') : _.pick(song, 'position')}
                    form={`edit-playlistsong-${song.id}`}
                    enableReinitialize={true}
                />
            );
        }
    };

    const renderDeleteButton = () => {
        if (authorized) {
            return (
                <DeleteButton
                    onSubmit={() => deletePlaylistSong(song.id, playlist.id)}
                    displayName={titles[song.title].title}
                />
            );
        }
    };

    const current = audio.currentSong ? audio.currentSong.audio : null;
    const parent = audio.parent ? audio.parent.id : null;

    let currentClass = '';

    if (current && song.bounce) {
        currentClass = parent === playlist.id && current === song.bounce ? 'current-song' : '';
    }


    return (
        <div className='title-margin'>
            <div className={`row title ${currentClass}`}>                    
                <div className="marqee">
                    <div className='row-name'>
                        <div className="song-position">{song.position}</div>
                        <div className='name-spot'>
                            <h3>{song && titles[song.title] && titles[song.title].title}</h3>
                        </div>
                    </div>      

                    {renderPlayContainer()}
                    <div className="tier-display">
                        {renderEditButton()}
                        {renderDeleteButton()}
                    </div>
                </div>
            </div>
        </div>
    );

};



const mapStateToProps = state => {

    return {
        playlistSongs: state.playlistSongs,
        bands: state.bands,
        playlists: state.playlists,
        versions: state.versions,
        bounces: state.bounces,
        titles: state.titles,
        audio: state.audio
    }

}

export default connect(mapStateToProps, { fetchBounces, fetchVersions, editPlaylistSong, deletePlaylistSong })(requireAuth(PlaylistSong));