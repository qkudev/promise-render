import { reactive } from '../reactive';

describe('reactive var', () => {
  it('should set initial state', () => {
    const $x = reactive({ a: 1 });

    expect($x()).toEqual({ a: 1 });
  });

  it('should set next value', () => {
    const $x = reactive({ a: 1 });

    expect($x({ a: 2 })).toEqual({ a: 2 });
  });

  it('should handle listeners', () => {
    const $x = reactive({ a: 1 });
    const listener = jest.fn();
    const unsubscribe = $x.onChange(listener);

    $x({ a: 2 });

    expect(listener).toHaveBeenCalledWith({ a: 2 });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    $x({ a: 3 });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should not call listeners if state not truly changed', () => {
    const $x = reactive(1);
    const listener = jest.fn();
    $x.onChange(listener);

    $x(1);

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it('should use given equality fn', () => {
    const $x = reactive(
      { a: 1 },
      (a, b) => JSON.stringify(a) === JSON.stringify(b)
    );
    const listener = jest.fn();
    $x.onChange(listener);

    $x({ a: 1 });

    expect(listener).toHaveBeenCalledTimes(0);
    expect($x()).toEqual({ a: 1 });
  });

  it('should accept callback to modify value', () => {
    const $x = reactive(1);
    const inc = (val: number) => val + 1;

    const $inc = () => $x(inc);

    expect($inc()).toBe(2);
    expect($x()).toBe(2);
  });
});
