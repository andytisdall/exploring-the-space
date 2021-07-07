import React, { useEffect, useState, version } from 'react';
import { connect } from 'react-redux';

import Version from './Version';
import AuthControl from './AuthControl';
import AddButton from './AddButton';
import { fetchVersions, fetchBounces } from '../actions';
import PlayContainer from './PlayContainer';

const Title = ({ tier, title, fetchVersions, versions, bounces, fetchBounces }) => {

    const [expand, setExpand] = useState(false);

    const arrow = expand ? 'down' : 'right';

    useEffect(() => {
        fetchVersions(title.id);
    }, []);

    const versionList = title.versions.map(id => versions[id]);

    const currentVersion = versionList[0] ? versionList.find(v => v.current) : null;

    useEffect(() => {
        if (currentVersion) {
            fetchBounces(currentVersion.id);
        }
    }, [currentVersion]);

    const bounceList = currentVersion ? currentVersion.bounces.map(id => bounces[id]) : null;

    let currentBounce;

    if (bounceList && bounceList[0]) {

        currentBounce = bounceList.find(b => b.latest);
    
    }

    const renderPlayContainer = () => {

        if (currentVersion && currentBounce) {
            return <PlayContainer song={{
                tier,
                title,
                version: currentVersion,
                bounce: currentBounce
            }} />;
        }
    }

    const renderVersion = () => {
   
        return (
            <Version versions={versionList} />
        )
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
                    <AuthControl>
                        <div className='tier-display'>
                            <AddButton title="Add to a Playlist" />
                            <AddButton title={`Edit ${title.title}`} />
                            {/* <DeleteButton /> */}
                        </div>
                    </AuthControl>
                    {/* <Download /> */}
                </div>
            </div>
            {expand && renderVersion()}
        </div>
    );
};

const mapStateToProps = state => {
    return {
        versions: state.versions,
        bounces: state.bounces
    }
}

export default connect(mapStateToProps, { fetchVersions, fetchBounces })(Title);