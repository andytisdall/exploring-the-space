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
            <div onClick={this.props.onDismiss} className="modal-background">
                <div 
                    onClick={e => e.stopPropagation()}
                    className="modal-box"
                >
                    <div className="modal-title">
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