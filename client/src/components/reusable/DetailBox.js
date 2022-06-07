import React, { useEffect, useState, useRef } from 'react';
import moment from 'moment';

const DetailBox = ({
  selectedItem,
  itemList,
  itemType,
  displayItem,
  setSelected,
  renderAddButton,
  renderEditButton,
  renderDeleteButton,
  playButton,
  onAddSubmit,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [droppingFile, setDroppingFile] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const onBodyClick = (e) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) {
        return;
      }

      if (dropdownVisible) {
        setDropdownVisible(false);
      }
    };

    if (dropdownVisible) {
      document.addEventListener('click', onBodyClick, { capture: true });
    } else {
      document.removeEventListener('click', onBodyClick, { capture: true });
    }
    return () =>
      document.removeEventListener('click', onBodyClick, { capture: true });
  }, [dropdownVisible]);

  const count = () => {
    let count;
    if (itemList().length === 0) {
      count = `1 ${itemType}:`;
    } else {
      count = `${itemList().length + 1} ${itemType}s:`;
    }

    return <h5>{count}</h5>;
  };

  const currentTag = () => {
    if (selectedItem.current || selectedItem.latest) {
      return <div className="current">Current</div>;
    }
  };

  const renderItemList = () => {
    if (dropdownVisible) {
      return itemList().map((i) => {
        const current =
          i.current || i.latest ? (
            <span className="list-current"> * current</span>
          ) : null;
        return (
          <div
            className="dropdown-link"
            onClick={() => {
              setSelected(i);
              setDropdownVisible(false);
            }}
            key={i.id}
          >
            {displayItem(i)}
            {current}
          </div>
        );
      });
    }
  };

  const renderNotes = () => {
    if (selectedItem.notes || selectedItem.comments) {
      return (
        <div className="detail-notes">
          <div className="detail-notes-title">Notes:</div>
          <p>{selectedItem.notes || selectedItem.comments}</p>
        </div>
      );
    }
  };

  const renderDetail = () => {
    if (selectedItem) {
      return (
        <div className="detail-content">
          <div className="detail-header">
            {count()}
            {currentTag()}
          </div>
          <div className="dropdown-container">
            <div className="dropdown" ref={dropdownRef}>
              <button
                className="dropbtn"
                onClick={() => setDropdownVisible(!dropdownVisible)}
              >
                {displayItem(selectedItem)}
              </button>
              <div className="dropdown-content">{renderItemList()}</div>
            </div>
            {playButton && playButton()}
          </div>
          {renderNotes()}
        </div>
      );
    } else {
      let parentType = '';
      if (itemType === 'Version') {
        parentType = 'Song';
      }
      if (itemType === 'Bounce') {
        parentType = 'Version';
      }
      return (
        <div className="detail-content">
          <div className="detail-header">
            <h5>{`No ${itemType}s for this ${parentType} Yet`}</h5>
          </div>
        </div>
      );
    }
  };

  const onDragOver = (e) => {
    if (!droppingFile) {
      setDroppingFile(true);
    }
  };

  const onMouseOver = (e) => {
    if (droppingFile) {
      setDroppingFile(false);
    }
  };

  const onDrop = (e) => {
    // this is the only way the file would be defined!
    setTimeout(() => {
      const { files } = e.target;
      // const words = files[0].name.split(' ');
      // let date = new Date(words[words.length - 1].split('.')[0]);

      // if (!date instanceof Date || isNaN(date)) {
      //   date = new Date();
      // }
      const fileName = files[0].name.split('.')[0];
      let date = new moment(fileName);
      if (!date.isValid()) {
        date = new Date();
      }
      const formValues = {
        date,
        comments: '',
        latest: true,
        file: files,
      };
      onAddSubmit(formValues);
    }, 0);
  };

  if (itemType === 'Bounce') {
    return (
      <div className={`detail-box ${itemType === 'Bounce' ? 'bounce' : ''}`}>
        <div className="drag" onDragOver={onDragOver}>
          <input
            type="file"
            onDrop={onDrop}
            onMouseOver={onMouseOver}
            onClick={(e) => e.preventDefault()}
            className={`bounce-drop-zone ${droppingFile && 'dropping'}`}
          />

          {renderDetail()}
          <div className="detail-buttons">
            {renderAddButton()}
            {selectedItem && renderEditButton()}
            {selectedItem && renderDeleteButton()}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={`detail-box ${itemType === 'Bounce' ? 'bounce' : ''}`}>
        {renderDetail()}
        <div className="detail-buttons">
          {renderAddButton()}
          {selectedItem && renderEditButton()}
          {selectedItem && renderDeleteButton()}
        </div>
      </div>
    );
  }
};

export default DetailBox;
