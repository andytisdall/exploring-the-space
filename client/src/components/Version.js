import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { fetchBounces } from '../actions';
import AuthControl from './AuthControl';
import Bounce from './Bounce';
import AddButton from './AddButton';

const Version = ({ versions, bounces, fetchBounces }) => {

    const [selectedVersion, setSelectedVersion] = useState(versions.find(v => v.current));

    useEffect(() => {
        fetchBounces(selectedVersion.id);
    }, [selectedVersion]);

    const renderVersionList = () => {
        
        const versionList = versions.filter(v => v !== selectedVersion);

        return versionList.map(v => {
            return <div
                className="dropdown-link change-version"
                onClick={() => setSelectedVersion(v)}
                key={v.id}
            >
                    {v.name}
            </div>
        });
    };
    
    const renderBounces = () => {

        const bouncesToRender = selectedVersion.bounces.map(id => bounces[id]);

        if (bouncesToRender[0]) {
            return (
                <Bounce bounces={bouncesToRender} />
            );
        }
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
                        {/* <DeleteButton /> */}
                    </div>
                </AuthControl>
            </div> 
            {renderBounces()}          
        </div>
        
    );
};

const mapStateToProps = state => {
    return {
        bounces: state.bounces
    }
}

export default connect(mapStateToProps, { fetchBounces })(Version);