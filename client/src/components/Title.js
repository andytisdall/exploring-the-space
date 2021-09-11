import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import Version from './Version';
import AddButton from './AddButton';
import { fetchVersions, fetchBounces, selectBounce, selectVersion, createPlaylistSong } from '../actions';
import PlayContainer from './PlayContainer';
import requireAuth from './requireAuth';

const Title = ({ tier, title, fetchVersions, versions, bounces, fetchBounces, authorized, band, playlists, selectVersion, selectBounce, createPlaylistSong }) => {

    const [expand, setExpand] = useState(false);
    const [versionList, setVersionList] = useState(null);
    const [bounceList, setBounceList] = useState(null);
    const [song, setSong] = useState(null);

    const arrow = expand ? 'down' : 'right';

    useEffect(() => {
        fetchVersions(title.id);
    }, []);

    useEffect(() => {
        if (title.versions.length) {
            setVersionList(title.versions.map(id => versions[id]));
            // console.log('set version list')
        }
    }, [versions, title]);

    useEffect(() => {
        if (versionList && versionList[0]) {
            let versionToSelect = title.selectedVersion;
            if (!title.selectedVersion) {
                versionToSelect = versionList.find(v => v.current);
            }
            selectVersion(versionToSelect, title.id);
            // console.log('select version')
        }
        if (title.selectedVersion && !bounceList) {
            fetchBounces(title.selectedVersion.id);
            // console.log('fetch bounces')
        }
    }, [versionList]);

    useEffect(() => {
        if (title.selectedVersion && title.selectedVersion.bounces[0] && (!bounceList || !bounceList[0])) {
            setBounceList(title.selectedVersion.bounces.map(id => bounces[id]));
            // console.log('set bounce list')
        }
    }, [bounces]);

    useEffect(() => {
        if (!title.selectedBounce && bounceList && bounceList[0]) {
            let bounceToSelect = title.selectedBounce;
            if (!title.selectedBounce) {
                bounceToSelect = bounceList.find(b => b.latest);
            }
            if (bounceToSelect) {
                selectBounce(bounceToSelect, title.id);
            }
            // console.log('select bounce')
        }
        if (!song && title.selectedVersion && title.selectedBounce) {
            setSong({
                tier,
                title,
                version: title.selectedVersion,
                bounce: title.selectedBounce
            });
            // console.log('set song')
        }
    }, [bounceList]);

    useEffect(() => {

        if (title.selectedVersion && title.selectedBounce) {
            setSong({
                tier,
                title,
                version: title.selectedVersion,
                bounce: title.selectedBounce
            });
            // console.log('title update')
        }
    }, [title.selectedVersion, title.selectedBounce]);


    const renderPlayContainer = () => {

        if (song) {
            return <PlayContainer song={song} parentType="tier" />;
        }
    }

    const renderVersion = () => {
   
        return (
            <Version versions={versionList} title={title} />
        )
    }

    const onAddToPlaylist = formValues => {
        createPlaylistSong({
            ...formValues,
            bounce: title.selectedBounce.id,
            version: title.selectedVersion.id,
            title: title.id
        });
    }

    const renderButtons = () => {
        if (authorized) {
            const bandPlaylists = band.playlists.map(id => playlists[id]);
            const playlistOptions = bandPlaylists.map(pl => {
                if (pl) {
                    return { value: pl.id, display: pl.name};
                }
            });
            return (
                <div className='tier-display'>
                    {song && <AddButton
                        title="Add to a Playlist"
                        onSubmit={formValues => onAddToPlaylist(formValues)}
                        image="images/playlist.png"
                        fields={[
                            {
                                type: 'select',
                                options: playlistOptions,
                                name: 'playlistId',
                                label: 'Playlist'
                            }
                        ]}
                    />}
                    {/* <AddButton title={`Edit ${title.title}`}
                        onSubmit={onEditSubmit}
                    /> */}
                </div>
            )
        }
    }

    return (
        <div className="title-margin">
            <div className="row title">
                <div className="marqee">
                    <div className="row-name"  onClick={() => setExpand(!expand)} >
                        <img className="arrow" src={`/images/${arrow}-arrow.svg`} />
                        <div className="name-spot">
                            <h3>{title.title}</h3>
                        </div>
                    </div>
                    {renderPlayContainer()}
                    {renderButtons()}
                    {/* {download} */}
                </div>
            </div>
            {expand && renderVersion()}
        </div>
    );
};

const mapStateToProps = state => {
    return {
        versions: state.versions,
        bounces: state.bounces,
        band: state.bands.currentBand,
        playlists: state.playlists
    }
}

export default connect(mapStateToProps, { fetchVersions, fetchBounces, selectVersion, selectBounce, createPlaylistSong })(requireAuth(Title));