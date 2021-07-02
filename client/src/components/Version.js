import React from 'react';

import Bounce from './Bounce';

const Version = () => {

    const renderBounces = props => {
        return props.bounces.map(bounce => {
            return <Bounce />
        });
    };
    
    return (
        <div className="version-container">
            <div className="detail-box">
                <div className="detail-content">
                    <div className="detail-header">
                        <h5>Version:</h5>
                        <div className="dropdown">
                            <button className="dropbtn">
                                {selectedVersion.name}
                            </button>
                            <div className="dropdown-content">
                                {renderVersionList()}
                            </div>
                        </div>
                    </div>
                </div>
                <AuthControl>
                    <div className="detail-buttons">
                        <AddButton />
                        <AddButton />
                        <DeleteButton />
                    </div>
                </AuthControl>
            </div>
            {renderBounces()}
        </div>
    );

};

export default Version;