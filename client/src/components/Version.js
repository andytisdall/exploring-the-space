import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { fetchBounces } from '../actions';
import AuthControl from './AuthControl';
import Bounce from './Bounce';
import AddButton from './AddButton';

const Version = ({ version, bounces, fetchBounces,  }) => {


    useEffect(() => {
        fetchBounces(version.id);
    }, [])

    const bounceList = bounces.map(b => version.bounces.includes(b.id));

    const renderBounce = bounce => {
        return (
            <Bounce bounce={bounce} />
        )
    }
    
    return (
        <div className="version-container">
            <div className="detail-box">
                <div className="detail-content">
                    <div className="detail-header">
                        <h5>Version:</h5>
                        <div className="dropdown">
                            <button className="dropbtn">
                                {version.name}
                            </button>
                            <div className="dropdown-content">
                                {bounceList}
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
            {renderBounce()}
        </div>
    );

};

export default Version;