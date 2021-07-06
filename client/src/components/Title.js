import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import Version from './Version';
import AuthControl from './AuthControl';
import AddButton from './AddButton';
import { fetchVersions } from '../actions';
// import PlayContainer from './PlayContainer';

const Title = ({ title, fetchVersions, versions }) => {

    useEffect(() => {
        fetchVersions(title.id);
    }, [])

    const versionList = versions.map(v => title.versions.includes(v.id));

    const { selectedVersion } = versions;

    const renderVersion = version => {
        return (
            <Version version={version} />
        )
    }

    return (
        <div className="title-margin">
            <div className="row title">
                <div class="marqee">
                    <div className="row-name">
                        <img className="arrow" src="right-arrow.svg" />
                        <div className="name-spot">
                            <h3>{title.title}</h3>
                        </div>
                    </div>
                    {/* <PlayContainer /> */}
                    <AuthControl>
                        <AddButton title="Add to a Playlist" />
                        <AddButton title={`Edit ${title.title}`} />
                        {/* <DeleteButton /> */}
                    </AuthControl>
                    {/* <Download /> */}
                </div>
            </div>
            <div className="version-container">
                {renderVersion(selectedVersion)}
            </div>
        </div>
    );
};

const mapStateToProps = state => {
    return {
        versions: state.versions
    }
}

export default connect(mapStateToProps, { fetchVersions })(Title);