import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';

import AddButton from './AddButton';
import { editPlaylistSong, fetchVersions, fetchBounces } from '../actions';
import PlayContainer from './PlayContainer';
import requireAuth from './requireAuth';

const PlaylistSong = ({ playlist, song, playlistSongs, authorized, versions, bounces, titles, fetchBounces, fetchVersions }) => {

    const [playSong, setPlaySong] = useState(null);

    useEffect(() => {
        fetchVersions(song.title);
        titles[song.title].versions.forEach(id => {
            fetchBounces(id);
        });
    }, []);
    
    useEffect(() => {
        if (bounces[song.bounce] && versions[song.version] && titles[song.title]) {
            setPlaySong({
                    playlist,
                    title: titles[song.title],
                    version: versions[song.version],
                    bounce: bounces[song.bounce],
                    self: song
                });
        }
        console.log(bounces);
    }, [versions, bounces]);

    const renderPlayContainer = () => {

        if (playSong) {
            return <PlayContainer song={playSong} parentType="playlist" />;
        } else {
            return (
                <div className="playlistsong-no-bounce">
                    <div>
                        {versions[song.version] ? `${versions[song.version].name}` : 'No Version Selected'}
                    </div>
                    <div>
                        No Bounce Selected
                    </div>
                </div>
            );
        }
    };

    const onEditSubmit = formValues => {
        const thisVersion = Object.values(versions.filter(v => v.bounces.includes(formValues.bounce)));
        editPlaylistSong({
            ...formValues,
            version: thisVersion.id,
        }, song.id);
    };

    const renderEditButton = () => {
        if (authorized) {

            const otherSongs = Object.values(playlistSongs)
                .filter(s => playlist.songs.includes(s.id))
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
                            console.log()
                            editOptions.push({
                                value: b.id,
                                display: `${v.name} -- ${moment.utc(b.date).format('MM/DD/YY')}`
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
                            options: editOptions
                        }
                    ]}
                    initialValues={_.pick(song, 'position', 'bounce')}
                    form={`edit-playlistsong-${song.id}`}
                    enableReinitialize={true}
                />
            );
        }
    };


    return (
        <div className='title-margin'>
            <div className="title">                    
                <div className="marqee">
                    <div className='row-name'>
                        <div className="song-position">{song.position}</div>
                        <div className='name-spot'>
                            <h3>{song && titles[song.title].title}</h3>
                        </div>
                    </div>      

                    {renderPlayContainer()}
                    {renderEditButton()}
                        
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
        titles: state.titles
    }

}

export default connect(mapStateToProps, { fetchBounces, fetchVersions })(requireAuth(PlaylistSong));