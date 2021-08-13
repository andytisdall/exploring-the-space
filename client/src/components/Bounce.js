import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { selectBounce } from '../actions';

const Bounce = ({ bounces, selectBounce, title }) => {

    const [selectedBounce, setSelectedBounce] = useState(title.selectedBounce);

    useEffect(() => {
        selectBounce(selectedBounce, title);
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

    const renderBounce = () => {
        if (selectedBounce) {
            return <>
                <h5>Date:</h5>
                <div className='dropdown'>
                    <button className='dropbtn'>{displayDate(selectedBounce.date)}</button>
                    <div className='dropdown-content'>
                        {renderBounceList()}
                    </div>
                    <div className='detail-notes'>{selectedBounce.comments}</div>
                </div>
            </>
        } else {
            return <h5>No Bounces for this Version</h5>
        }
    };


    return (
        <div className="detail-box">
            <div className='detail-content'>
                <div className='detail-header'>
                    
                {renderBounce()}
                    
                </div>   
            </div>
        </div>
    );
};

export default connect(null, { selectBounce })(Bounce);