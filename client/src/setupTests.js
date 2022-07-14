// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

import { server } from './mocks/server';

window.scroll = () => {};

// window.HTMLMediaElement.prototype.load = () => {};
// window.HTMLMediaElement.prototype.play = () => {};
// window.HTMLMediaElement.prototype.pause = () => {};

// set up server before all tests and then close after
beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
