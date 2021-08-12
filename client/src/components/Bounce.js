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


    return (
        <div className="detail-box">
            <div className='detail-content'>
                <div className='detail-header'>
                   <h5>Date:</h5>
                    <div className='dropdown'>
                        <button className='dropbtn'>{displayDate(selectBounce.date)}</button>
                        <div className='dropdown-content'>
                            {renderBounceList()}
                                
                        </div>
                    </div>

                    <div className='detail-notes'>{selectedBounce.comments}</div>
                </div>   
            </div>
        </div>
    );
};

export default connect(null, { selectBounce })(Bounce);