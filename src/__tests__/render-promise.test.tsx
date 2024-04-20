import React, { FC, FormEventHandler, useRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AsyncComponentProps } from '../types';
import { renderPromise } from '../render-promise';
import '@testing-library/jest-dom';

describe('renderPromise', () => {
  const NumberForm: FC<AsyncComponentProps<number>> = ({ resolve }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const onSubmit: FormEventHandler<HTMLFormElement> = e => {
      e.preventDefault();

      const value = Number(inputRef.current?.value);
      resolve(value);
    };

    return (
      <form onSubmit={onSubmit}>
        <input ref={inputRef} type="number" data-testid="number-input" />
        <button
          type="button"
          data-testid="submit-btn"
          onClick={() => resolve(42)}
        >
          submit
        </button>
      </form>
    );
  };

  let [getNumber, AsyncNumberForm] = renderPromise(NumberForm);

  const App = () => (
    <div>
      <AsyncNumberForm />
    </div>
  );

  let result = render(<App />);

  beforeEach(() => {
    [getNumber, AsyncNumberForm] = renderPromise(NumberForm);
    result = render(<App />);
  });

  afterEach(() => {
    result.unmount();
  });

  const getInput = () => screen.findByTestId('number-input');
  const getSubmit = () => screen.findByTestId('submit-btn');

  it('should render app', () => {
    expect(result.container).toBeDefined();
    expect(getNumber).toBeInstanceOf(Function);
  });

  it('should not render async component when no call', () => {
    expect(() => result.getByTestId('number-input')).toThrow();
  });

  it('should render after async function has been called', async () => {
    act(() => {
      getNumber();
    });

    const input = await getInput();

    expect(input).toBeDefined();
  });

  it('should handle input and resolve with value', async () => {
    const fn = jest.fn();
    act(() => {
      getNumber().then(fn);
    });

    const input = await screen.findByTestId('number-input');
    await userEvent.type(input, '42');
    await userEvent.click(await getSubmit());

    expect(fn).toHaveBeenCalledWith(42);
  });

  it('should unmount form after resolve has been called', async () => {
    act(() => {
      getNumber();
    });
    const input = await screen.findByTestId('number-input');
    await userEvent.type(input, '42');
    await userEvent.click(await getSubmit());

    expect(() => getInput()).rejects.toThrow();
  });
});
