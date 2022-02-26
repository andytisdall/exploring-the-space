import React from 'react';

const AddRecordingSelector = ({
  stateList,
  onSelect,
  selectedItem,
  label,
  date,
  addButton,
}) => {
  const renderInput = () => {
    if (!date) {
      const onChange = (e) => {
        const selected = stateList.find((item) => item.id === e.target.value);
        onSelect(selected);
      };
      const defaultItem = { name: 'choose...', id: '0' };
      const list = [defaultItem, ...stateList];
      const options = list.map((item) => {
        if (item) {
          const name = item.name || item.title;
          return (
            <option value={item.id} key={item.id} disabled={item.id === '0'}>
              {name}
            </option>
          );
        }
      });

      return (
        <select onChange={onChange} value={selectedItem.id}>
          {options}
        </select>
      );
    } else {
      return (
        <input
          type="date"
          value={selectedItem}
          onChange={(e) => onSelect(e.target.value)}
          className="calendar"
        />
      );
    }
  };

  return (
    <div className="add-recording-select-row">
      <div className="add-recording-label">{label}:</div>
      <div className="add-recording-input">
        <div>{renderInput()}</div>
        {addButton}
      </div>
    </div>
  );
};

export default AddRecordingSelector;
