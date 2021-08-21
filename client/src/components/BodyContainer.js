import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { fetchTiers, fetchPlaylists, createTier } from '../actions';
import Tier from './Tier';
import Playlist from './Playlist';
import AddButton from './AddButton';
import requireAuth from './requireAuth';

const BodyContainer = ({ fetchPlaylists, createTier, fetchTiers, tiers, playlists, band, authorized }) => {

    const [tierList, setTierList] = useState([]);

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

    const renderTiers = () => {

        return tierList.map(tier => {
            if (tier) {
                return (
                    <Tier tier={tier} key={tier.id} />
                );
            }
        });
    };


    const onCreateSubmit = formValues => {
        createTier(formValues);
    };

    const renderAddButton = () => {
        if (authorized) {
            return (
                <div className="centered-button">
                    <AddButton
                        onSubmit={onCreateSubmit}
                        title='Add a Tier'
                        image="/images/add.png"
                        fields={[{
                            label: 'Tier Name',
                            name: 'tierName',
                            type: 'input',               
                        }]}
                    />
                </div>
            );
        }
    };

    const renderPlaylists = () => {

        const playlistsToRender = band.playlists.map(id => playlists[id]);

        return playlistsToRender.map(playlist => {
            if (playlist) {
                return (
                    <Playlist playlist={playlist} key={playlist.id} />               
                );
            }
        });
    };



    return (
        <>
            <hr />
            {renderTiers()}
            {renderAddButton()}
            <div className="playlists">
                <h2>Playlists</h2>
                <hr />
                {playlists && renderPlaylists()}
            </div>
        </>


    );


};

const mapStateToProps = state => {
    return {
        tiers: state.tiers,
        playlists: state.playlists,
    };
};

export default connect(mapStateToProps, { fetchTiers, fetchPlaylists, createTier })(requireAuth(BodyContainer));