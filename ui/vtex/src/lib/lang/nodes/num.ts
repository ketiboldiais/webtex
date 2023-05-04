type CState<T, M = any> = {
  value: T;
  meta: M;
  error?: string;
};

type Calc<T> = (state: CState<any>) => CState<T>;

