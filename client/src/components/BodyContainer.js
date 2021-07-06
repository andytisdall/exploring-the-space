import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchTiers, fetchPlaylists } from '../actions';
import Tier from './Tier';
import Playlist from './Playlist';
import AddButton from './AddButton';

const BodyContainer = ({ fetchPlaylists, fetchTiers, tiers, playlists, band}) => {


    useEffect(() => {
        fetchTiers(band.id);
        // fetchPlaylists(band.id);
    }, [])


    const renderTiers = () => {

        const tiersToRender = band.tiers.map(id => tiers[id]);

        // console.log(tiers);

        console.log(tiersToRender);

        return tiersToRender.map(tier => {
            if (tier) {
                return (
                    <Tier tier={tier} />
                );
            }
        });
    };

    // const renderPlaylists = () => {

    //     const playlistsToRender = band.playlists.map(id => playlists[id]);

    //     console.log(playlistsToRender);

    //     return playlistsToRender.map(playlist => {
    //         return (
    //             <Playlist playlist={playlist} />               
    //         );
    //     });
    // };



    return (
        <>
            <hr />
            {renderTiers()}
            <AddButton />
            <div className="playlists">
                <h2>Playlists</h2>
                <hr />
                {/* {playlists && renderPlaylists()} */}
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

export default connect(mapStateToProps, { fetchTiers, fetchPlaylists })(BodyContainer);