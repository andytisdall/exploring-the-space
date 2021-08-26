import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { fetchBounces, selectVersion, createVersion } from '../actions';
import Bounce from './Bounce';
import AddButton from './AddButton';
import requireAuth from './requireAuth';

const Version = ({ versions, bounces, fetchBounces, selectVersion, title, createVersion, authorized }) => {

    const [selectedVersion, setSelectedVersion] = useState(title.selectedVersion);

    useEffect(() => {
        if (selectedVersion) {
            fetchBounces(selectedVersion.id);
            selectVersion(selectedVersion, title.id);
        }
    }, [selectedVersion]);

    useEffect(() => {
        setSelectedVersion(title.selectedVersion);
    }, [versions]);

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

        if (selectedVersion) {

            const bouncesToRender = selectedVersion.bounces.map(id => bounces[id]);


            return (
                <Bounce bounces={bouncesToRender} title={title} version={selectedVersion} />
            );
            
        }
    };

    const renderAddButton = () => {
        if (authorized) {
            return (
                <AddButton
                    title={`Add a Version of ${title.title}`}
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

    const renderVersionDetail = () => {
        if (selectedVersion) {
            return (
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
                    <div className="detail-notes">
                        {selectedVersion.notes}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="detail-content">
                    <div className="detail-header">
                        <h5>No Versions for this Song Yet</h5>
                    </div>
                </div>
            );
        }
    }

    
    return (
        <div className="version-container">
            <div className="detail-box">
                {renderVersionDetail()}      
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
    };
}

export default connect(mapStateToProps, { fetchBounces, selectVersion, createVersion })(requireAuth(Version));