export interface AsyncComponentProps<T> {
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}
