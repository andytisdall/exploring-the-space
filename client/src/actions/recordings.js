import lamejs from 'lamejs';
import { Lame } from 'node-lame';
import Crunker from 'crunker';

import {
  CREATE_RECORDING,
  CLEAR_RECORDINGS,
  FETCH_RECORDING,
  DELETE_RECORDING,
  COMBINE_RECORDINGS,
} from './types';
import { errorHandler } from './errors';
import greenhouse from '../apis/greenhouse';

export const fetchRecording = (recordingId, index) => {
  return {
    type: FETCH_RECORDING,
    payload: { index, id: recordingId },
  };
};

export const combineRecordings = () => async (dispatch, getState) => {
  const { recordingList } = getState().recordings;

  const response = await greenhouse.post(
    `/recordings/combine`,
    { recordingList },
    { responseType: 'blob' }
  );

  dispatch({ type: COMBINE_RECORDINGS, payload: response.data });
  // const context = new AudioContext();
  // context.decodeAudioData(response.data, (audioBuffer) => {

  //   const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  //   dispatch({ type: COMBINE_RECORDINGS, payload: blob });
  // });

  // const blob = new Blob([outputBuffer], { type: 'audio/mpeg' });
  // dispatch({ type: COMBINE_RECORDINGS, payload: response.data });
  // const crunker = new Crunker();
  // const audioBuffers = [];

  // data.forEach((arrayBuffer) => {
  //   context.decodeAudioData(arrayBuffer, (audioBuffer) => {
  //     audioBuffers.push(audioBuffer);
  //   });
  // });
  // console.log(audioBuffers);
  // crunker.concatAudio(audioBuffers).then((output) => {
  //   const { blob } = output;

  // });

  // const appendBuffer = (buffer1, buffer2) => {
  //   const tmp = context.createBuffer(
  //     1,
  //     buffer1.length + buffer2.length,
  //     buffer1.sampleRate
  //   );

  //   const channel = tmp.getChannelData(0);
  //   channel.set(buffer1.getChannelData(0), 0);
  //   channel.set(buffer2.getChannelData(0), buffer1.length);

  //   return tmp;
  // };

  // let outputBuffer;

  // const chainBuffers = (buf) => {
  //   context.decodeAudioData(buf, (buffer) => {
  //     if (!outputBuffer) {
  //       outputBuffer = buffer;
  //     } else {
  //       outputBuffer = appendBuffer(outputBuffer, buffer);
  //     }
  //     if (responses.length) {
  //       chainBuffers(data.shift());
  //     }
  //   });
  // };

  // console.log(data[0]);

  // chainBuffers(data.shift());

  // const blob = new Blob([outputBuffer], { type: 'audio/mpeg' });

  // dispatch({ type: COMBINE_RECORDINGS, payload: response.data });

  // const mp3Data = [];
  // const mp3Encoder = new lamejs.Mp3Encoder(1, 441000, 128);
  // const sampleBlockSize = 1152;
  // console.log(lamejs.WavHeader.readHeader);
  // const wav = lamejs.WavHeader.readHeader(new DataView(response.data));
  // console.log(wav);
  // const samples = new Int16Array(response.data);

  // let remaining = samples.length;

  // for (let i = 0; remaining >= sampleBlockSize; i += sampleBlockSize) {
  //   const sampleChunk = samples.subarray(i, i + sampleBlockSize);
  //   const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
  //   if (mp3buf.length > 0) {
  //     mp3Data.push(new Int8Array(mp3buf));
  //   }
  //   remaining -= sampleBlockSize;
  // }
  // const lastChunk = mp3Encoder.flush();
  // if (lastChunk.length) {
  //   mp3Data.push(new Int8Array(lastChunk));
  // }

  // const blob = new Blob(mp3Data, { type: 'audio/mpeg' });
  // console.log(blob);
  // console.log(response.data);
  // const toBuffer = (ab) => {
  //   const buf = Buffer.alloc(ab.byteLength);
  //   const view = new Uint8Array(ab);
  //   for (let i = 0; i < buf.length; ++i) {
  //     buf[i] = view[i];
  //   }
  //   return buf;
  // };
  // const buffer = toBuffer(response.data);
  // console.log(Buffer.isBuffer(buffer));
  // const encoder = new Lame({
  //   output: 'buffer',
  //   bitrate: 128,
  // }).setBuffer(buffer);

  // encoder
  //   .encode()
  //   .then(() => {
  //     const buffer = encoder.getBuffer();
  //     dispatch({ type: COMBINE_RECORDINGS, payload: buffer });
  //   })
  //   .catch((err) => {
  //     throw new Error(err.message);
  //   });
};

export const createRecording = (blob) => async (dispatch, getState) => {
  try {
    const currentBand = getState().bands.currentBand;
    const formData = new FormData();
    // const file = new File([blob], 'recording', {
    //   type: 'audio/webm;codecs=opus',
    // });
    formData.append('currentBand', currentBand);
    formData.append('file', blob);
    const response = await greenhouse.post('/recordings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // get the existing list of current recordings from local storage and add new stream id
    const recordingList =
      JSON.parse(localStorage.getItem('recording-list')) || [];
    localStorage.setItem(
      'recording-list',
      JSON.stringify([...recordingList, response.data])
    );

    dispatch({
      type: CREATE_RECORDING,
      payload: response.data,
    });
  } catch (err) {
    dispatch(errorHandler(err));
  }
};

export const clearRecordings = () => {
  const recordingList = JSON.parse(localStorage.getItem('recording-list'));
  if (recordingList) {
    recordingList.forEach((id) => {
      greenhouse.post('/recordings/delete', { id });
    });
    localStorage.removeItem('recording-list');
  }
  return { type: CLEAR_RECORDINGS };
};

export const deleteRecording = (id) => (dispatch) => {
  greenhouse.post('recordings/delete', { id });
  const recordingList = JSON.parse(localStorage.getItem('recording-list'));
  const editedList = recordingList.filter((recId) => recId !== id);
  localStorage.setItem('recording-list', JSON.stringify(editedList));
  dispatch({ type: DELETE_RECORDING, payload: id });
};
