import React from 'react';
import ReactDOM from 'react-dom';


class Modal extends React.Component {

    componentDidMount() {
        document.querySelector('.container').classList.add('modal-active');
    }
    componentWillUnmount() {
        document.querySelector('.container').classList.remove('modal-active');
    }

    render() {
        return ReactDOM.createPortal(
            <div onClick={this.props.onDismiss} className="dimmer">
                <div 
                    onClick={e => e.stopPropagation()}
                    className="modal-box"
                >
                    <div>
                        {this.props.content}
                    </div>
                    <div>
                        {this.props.actions}
                    </div>
                </div>
            </div>,
            document.querySelector('#modal')
        );
    }
};

export default Modal;