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
    if (!inputSource) {
      setInputSource(devices[0]);
    }
  };

  const micSelect = () => {
    const deviceList = devices.map((device) => {
      if (device) {
        return <option key={device.deviceId}>{device.label}</option>;
      }
    });
    return <select disabled={isRecording}>{deviceList}</select>;
  };

  return (
    <div className="device-control">
      <div>Input device:</div>
      <div className="mic-select">{micSelect()}</div>
    </div>
  );
};

export default DeviceControl;
