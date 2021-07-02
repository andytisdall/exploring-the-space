import React from 'react';

import VersionContainer from ',/VersionContainer';
import AuthControl from './AuthControl';
import PlayContainer from './PlayContainer';

const Title = () => {

    const renderVersions = () => {
        return 0;
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
                    <PlayContainer />
                    <AuthControl>
                        <AddButton title="Add to a Playlist" />
                        <AddButton title={`Edit ${title.title}`} />
                        <DeleteButton />
                    </AuthControl>
                    <Download />
                </div>
            </div>
            <div className="version-container">
                {renderVersions()}
            </div>
        </div>
    );
};

export default Title;