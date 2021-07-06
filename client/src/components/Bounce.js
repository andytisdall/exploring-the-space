import React, { useState } from 'react';
import moment from 'moment';

const Bounce = ({ bounces }) => {

    const [selectedBounce, setSelectedBounce] = useState(bounces.find(b => b.latest));

    const displayDate = moment.utc(selectedBounce.date).format('MM/DD/yy')

    const renderBounceList = () => {
        const bounceList = bounces.filter(b => b !== selectedBounce);

        return bounceList.map(b => {
            return <div
                className="dropdown-link change-song"
                onClick={() => setSelectedBounce(b)}
                key={b.id}
            >
                    {moment.utc(b.date).format('MM/DD/yy')}
            </div>
        });
    };


    return (
        <div className="detail-box">
            <div className='detail-content'>
                <div className='detail-header'>
                   <h5>Date:</h5>
                    <div className='dropdown'>
                        <button className='dropbtn'>{displayDate}</button>
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

export default Bounce;