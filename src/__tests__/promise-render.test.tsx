import React, { FC, FormEventHandler, useRef } from 'react';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AsyncComponentProps } from '../types';
import { promiseRender } from '../promise-render';
import '@testing-library/jest-dom';

describe('renderPromise', () => {
  const NumberForm: FC<AsyncComponentProps<number>> = ({ resolve, reject }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const onSubmit: FormEventHandler<HTMLFormElement> = e => {
      e.preventDefault();

      resolve(Number(inputRef.current?.value));
    };

    const cancel = () => {
      reject('Cancel');
    };

    return (
      <form onSubmit={onSubmit}>
        <input ref={inputRef} type="number" data-testid="number-input" />
        <button
          type="submit"
          data-testid="submit-btn"
          onClick={() => resolve(42)}
        >
          submit
        </button>
        <button type="button" onClick={cancel} data-testid="cancel-btn">
          cancel
        </button>
      </form>
    );
  };

  let [getNumber, AsyncNumberForm] = promiseRender(NumberForm);

  const App = () => (
    <div>
      <AsyncNumberForm />
    </div>
  );

  let result = render(<App />);

  beforeEach(() => {
    [getNumber, AsyncNumberForm] = promiseRender(NumberForm);
    result = render(<App />);
  });

  afterEach(() => {
    result.unmount();
  });

  const getInput = () => result.findByTestId('number-input');
  const getSubmit = () => result.findByTestId('submit-btn');
  const getCancel = () => result.findByTestId('cancel-btn');

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

    const input = await getInput();
    await userEvent.type(input, '42');
    await userEvent.click(await getSubmit());

    expect(fn).toHaveBeenCalledWith(42);
  });

  it('should unmount form after resolve has been called', async () => {
    act(() => {
      getNumber();
    });
    const input = await getInput();
    await userEvent.type(input, '42');
    await userEvent.click(await getSubmit());

    expect(result.container).toMatchInlineSnapshot(`
      <div>
        <div />
      </div>
    `);
  });

  it('should handle reject', async () => {
    const onError = jest.fn();
    act(() => {
      getNumber().catch(onError);
    });

    const cancelBtn = await getCancel();
    await userEvent.click(cancelBtn);

    expect(onError).toHaveBeenCalledWith('Cancel');
  });
});
