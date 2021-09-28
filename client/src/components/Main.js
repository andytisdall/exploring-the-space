import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { fetchTiers, fetchPlaylists, createTier, createPlaylist } from '../actions';
import Tier from './Tier';
import Playlist from './Playlist';
import AddButton from './AddButton';
import requireAuth from './requireAuth';

const BodyContainer = ({ fetchPlaylists, createTier, fetchTiers, tiers, playlists, band, authorized, createPlaylist, currentSong }) => {

    const [tierList, setTierList] = useState([]);
    const [playlistList, setPlaylistList] = useState([]);

    useEffect(() => {
        fetchTiers(band.id);
        fetchPlaylists(band.id);
    }, []);

    useEffect(() => {
        setTierList(band.tiers.map(id => tiers[id]).sort((a, b) => {
            if (a.position < b.position) {
                return -1;
            }
            if (b.position < a.position) {
                return 1;
            }
        }));
    }, [tiers]);

    useEffect(() => {
        setPlaylistList(band.playlists.map(id => playlists[id]).sort((a, b) => {
            if (a.position < b.position) {
                return -1;
            }
            if (b.position < a.position) {
                return 1;
            }
        }));
    }, [playlists]);

    const renderTiers = () => {

        return tierList.map(tier => {
            if (tier) {
                return (
                    <Tier tier={tier} key={tier.id} />
                );
            }
        });
    };


    const renderTierAddButton = () => {
        if (authorized) {
            return (
                <AddButton
                    onSubmit={formValues => createTier(formValues)}
                    title='Add a Tier'
                    image="/images/add.png"
                    fields={[{
                        label: 'Tier Name',
                        name: 'tierName',
                        type: 'input',
                        required: true          
                    }]}
                    addClass='add-left'
                    
                />
            );
        }
    };

    const renderPlaylistAddButton = () => {
        if (authorized) {
            return (
                <AddButton
                    onSubmit={formValues => createPlaylist(formValues)}
                    title='Add a Playlist'
                    image="/images/add.png"
                    fields={[{
                        label: 'Playlist Name',
                        name: 'playlistName',
                        type: 'input',
                        required: true             
                    }]}
                    addClass='add-left'
                />
            );
        }
    };

    const renderPlaylists = () => {

        return playlistList.map(playlist => {
            if (playlist) {
                return (
                    <Playlist playlist={playlist} key={playlist.id} />               
                );
            }
        });
    };

    const playbarActive = currentSong ? 'playbar-active' : ''

    return (
        <div className={`main ${playbarActive}`}>
            <div className="section-header">
                <h2 className="section-title">Tiers</h2>
                <div className="section-add">
                    {renderTierAddButton()}
                </div>
            </div>
            <hr />
            {tiers && renderTiers()}
            <div className="playlists">
                <div className="section-header">
                    <h2 className="section-title">Playlists</h2>
                    <div className="section-add">
                        {renderPlaylistAddButton()}
                    </div>
                </div>
                <hr />
                {playlists && renderPlaylists()}
            </div>
        </div>


    );


};

const mapStateToProps = state => {
    return {
        tiers: state.tiers,
        playlists: state.playlists,
        currentSong: state.audio.currentSong
    };
};

export default connect(mapStateToProps, { fetchTiers, fetchPlaylists, createTier, createPlaylist })(requireAuth(BodyContainer));