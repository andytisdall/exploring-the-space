import React, { useEffect, useState } from 'react';

const DeviceControl = ({ inputSource, setInputSource, isRecording }) => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    getDevices();
    navigator.mediaDevices.ondevicechange = getDevices;
  }, []);

  const getDevices = async () => {
    // get user input devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputDevices = devices.map((device) => {
      if (device.kind === 'audioinput' && device.deviceId !== 'default') {
        return device;
      }
    });
    setDevices(inputDevices);
    // if (!inputSource) {
    //   setInputSource(devices[0]);
    // }
  };

  const micSelect = () => {
    const deviceList = devices.map((device) => {
      if (device) {
        return (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        );
      }
    });
    const blank = <option key={'blank_device'} value={null}></option>;
    deviceList.unshift(blank);
    return (
      <select
        onChange={(e) => setInputSource(e.target.value)}
        disabled={isRecording}
      >
        {deviceList}
      </select>
    );
  };

  return (
    <div className="device-control">
      <div>Input device:</div>
      <div className="mic-select">{micSelect()}</div>
    </div>
  );
};

export default DeviceControl;
