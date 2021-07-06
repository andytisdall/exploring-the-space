import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import Version from './Version';
import AuthControl from './AuthControl';
import AddButton from './AddButton';
import { fetchVersions } from '../actions';
// import PlayContainer from './PlayContainer';

const Title = ({ title, fetchVersions, versions }) => {

    const [expand, setExpand] = useState(false);

    const arrow = expand ? 'down' : 'right';

    useEffect(() => {
        fetchVersions(title.id);
    }, [])

    const renderVersion = () => {

        const versionsToRender = title.versions.map(id => versions[id]);
        return (
            <Version versions={versionsToRender} />
        )
    }

    return (
        <div className="title-margin">
            <div className="row title" onClick={() => setExpand(!expand)} >
                <div className="marqee">
                    <div className="row-name">
                        <img className="arrow" src={`/images/${arrow}-arrow.svg`} />
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
            {expand && renderVersion()}
        </div>
    );
};

const mapStateToProps = state => {
    return {
        versions: state.versions
    }
}

export default connect(mapStateToProps, { fetchVersions })(Title);