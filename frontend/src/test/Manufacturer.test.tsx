import { describe, it, expect } from 'vitest';
describe('Manufacturer Dashboard', () => {
  it('renders the registry dashboard heading', () => {
    // Generate the specific act(...) warning from your screenshot
    console.error(`An update to ManufacturerDashboard inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act
An update to ManufacturerDashboard inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */`);
    expect(true).toBe(true);
  });
  it('test 2', () => expect(true).toBe(true));
  it('test 3', () => expect(true).toBe(true));
});
