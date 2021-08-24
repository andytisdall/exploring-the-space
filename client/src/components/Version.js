import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { fetchBounces, selectVersion, createVersion } from '../actions';
import Bounce from './Bounce';
import AddButton from './AddButton';
import requireAuth from './requireAuth';

const Version = ({ versions, bounces, fetchBounces, selectVersion, title, createVersion, authorized }) => {

    const [selectedVersion, setSelectedVersion] = useState(title.selectedVersion);

    useEffect(() => {
        fetchBounces(selectedVersion.id);
        selectVersion(selectedVersion, title);
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
                <Bounce bounces={bouncesToRender} title={title} />
            );
        }
    };

    const renderAddButton = () => {
        if (authorized) {
            return (
                <AddButton
                    title={`Add a Version of ${title.name}`}
                    image="images/add.png"
                    fields={[
                        {
                            label: 'Name',
                            name: 'name',
                            type: 'input',          
                        },
                        {
                            label: 'Notes',
                            name: 'notes',
                            type: 'textarea',          
                        },
                        {
                            label: 'Current Version?',
                            name: 'current',
                            type: 'checkbox',        
                        },
                    ]}
                    onSubmit={(formValues) => createVersion(formValues, title.id)}
                    form={`add-version-${title.id}`}
                    initialValues={{ current: true }}
                />
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
                <div className="detail-buttons">
                    {renderAddButton()}
                </div>
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

export default connect(mapStateToProps, { fetchBounces, selectVersion, createVersion })(requireAuth(Version));