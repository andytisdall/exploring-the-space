import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { fetchTiers, fetchPlaylists, createTier, fetchUser } from '../actions';
import Tier from './Tier';
import Playlist from './Playlist';
import AddButton from './AddButton';
import requireAuth from './requireAuth';

const BodyContainer = ({ fetchPlaylists, fetchUser, createTier, fetchTiers, tiers, playlists, band, authorized }) => {


    useEffect(() => {
        fetchTiers(band.id);
        fetchPlaylists(band.id);
    }, []);


    const renderTiers = () => {

        const tiersToRender = band.tiers.map(id => tiers[id]);


        return tiersToRender.map(tier => {
            if (tier) {
                return (
                    <Tier tier={tier} key={tier.id} initialValues={_.pick(tier, 'name', 'position')} />
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

export default connect(mapStateToProps, { fetchTiers, fetchUser, fetchPlaylists, createTier })(requireAuth(BodyContainer));