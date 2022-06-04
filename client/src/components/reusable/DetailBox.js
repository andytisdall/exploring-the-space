import React, { useEffect, useState, useRef } from 'react';

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
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

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

          <div className="detail-notes">
            <div className="detail-notes-title">Notes:</div>
            <p>{selectedItem.notes || selectedItem.comments}</p>
          </div>
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
};

export default DetailBox;
