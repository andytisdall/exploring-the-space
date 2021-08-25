import React from 'react';
import ReactDOM from 'react-dom';


const Modal = props => {

    return ReactDOM.createPortal(
        <div onClick={props.onDismiss} className="dimmer">
            <div 
                onClick={e => e.stopPropagation()}
                className="modal-box"
            >
                <div>
                    {props.content}
                </div>
                <div>
                    {props.actions}
                </div>
            </div>
        </div>,
        document.querySelector('#modal')
    );
};

export default Modal;