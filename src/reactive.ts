import { useEffect, useState } from 'react';

export type Listener<T> = (next: T) => void;

export interface Reactive<T> {
  (next?: T | ((current: T) => T)): T;

  onChange: (listener: Listener<T>) => () => void;
}

const defaultEqual = (a: unknown, b: unknown) => a === b;

export function reactive<T>(
  initialValue: T,
  equals = defaultEqual
): Reactive<T> {
  let current = initialValue;
  const listeners = new Set<Listener<T>>();

  function notifyListeners() {
    listeners.forEach(listener => {
      listener(current);
    });
  }

  function setValue(next: T) {
    if (equals(current, next)) {
      return current;
    }

    current = next;
    notifyListeners();

    return current;
  }

  function call(...args: [T] | []) {
    if (args.length) {
      const valueOrFunction = args[0];
      if (typeof valueOrFunction === 'function') {
        setValue(valueOrFunction(current));
      } else {
        setValue(args[0]);
      }
    }

    return current;
  }

  function onChange(listener: Listener<T>) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  call.onChange = onChange;

  return (call as unknown) as Reactive<T>;
}

export const useReactive = <T>($value: Reactive<T>) => {
  const [value, setValue] = useState($value());
  useEffect(() => $value.onChange(setValue), []);

  return value;
};
