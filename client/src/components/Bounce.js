import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import AddButton from './AddButton';
import requireAuth from './requireAuth';
import { selectBounce, createBounce } from '../actions';

const Bounce = ({ bounces, selectBounce, title, authorized, version, createBounce }) => {

    const [selectedBounce, setSelectedBounce] = useState(title.selectedBounce);

    useEffect(() => {
        selectBounce(selectedBounce, title.id);
    }, [selectedBounce]);


    const displayDate = date => {
        return moment.utc(date).format('MM/DD/yy');
    }

    const renderBounceList = () => {
        const bounceList = bounces.filter(b => b !== selectedBounce);

        return bounceList.map(b => {
            return <div
                className="dropdown-link change-song"
                onClick={() => setSelectedBounce(b)}
                key={b.id}
            >
                    {displayDate(b.date)}
            </div>
        });
    };

    const renderAddButton = () => {
        if (authorized) {
            return (
                <AddButton
                    title={`Add a Bounce of ${version.name}`}
                    image="images/add.png"
                    fields={[
                        {
                            label: 'File',
                            name: 'file',
                            type: 'file'
                        },
                        {
                            label: 'Date',
                            name: 'date',
                            type: 'date',          
                        },
                        {
                            label: 'Comments',
                            name: 'comments',
                            type: 'textarea',          
                        },
                        {
                            label: 'Latest Bounce?',
                            name: 'latest',
                            type: 'checkbox',        
                        },
                    ]}
                    onSubmit={(formValues) => createBounce(formValues, version.id)}
                    form={`add-bounce-${version.id}`}
                    initialValues={{ latest: true }}
                    addClass="bounce"
                />
            );
        }
    };
    

    const renderBounceDetail = () => {
        if (selectedBounce) {
            return (
                <div className='detail-content'>
                    <div className='detail-header'>
                        <h5>Date:</h5>
                        <div className='dropdown'>
                            <button className='dropbtn'>
                                {displayDate(selectedBounce.date)}
                            </button>
                            <div className='dropdown-content'>
                                {renderBounceList()}
                            </div>
                        </div>
                    </div>
                    <div className='detail-notes'>
                        {selectedBounce.comments}
                    </div>                         
                </div>
            );
        } else {
            return (
                <div className="detail-content">
                    <div className="detail-header">
                        <h5>No Bounces for this Version</h5>
                    </div>
                </div>
            );
        }
    };


    return (
        <div className="detail-box">   
            {renderBounceDetail()}                                            
            <div className="detail-buttons">
                {renderAddButton()}
            </div>
        </div>
    );
};

export default connect(null, { selectBounce, createBounce })(requireAuth(Bounce));