export type NextCallback<T> = (value: T) => void;
export type ErrorCallback = (error: Error) => void;
export type CompletCallback = () => void;

export interface Observer<T> {
  next: NextCallback<T>;
  error: ErrorCallback;
  complet: CompletCallback;
}

export default function subscribe<T>(
  iterable: AsyncIterable<T>,
  observer: Observer<T> | NextCallback<T>
): () => void {
  const iterator = iterable[Symbol.asyncIterator]();
  observer = makeObserver(observer);
  next(iterator, observer);
  return (): void => {
    iterator.return && iterator.return();
  };
}

async function next<T>(
  iterator: AsyncIterator<T>,
  observer: Observer<T>
): Promise<void> {
  try {
    const { done, value }: IteratorResult<T> = await iterator.next();

    if (done) {
      observer.complet();
    } else {
      observer.next(value);
      next(iterator, observer);
    }
  } catch (e) {
    observer.error(e);
  }
}

function makeObserver<T>(observer: Observer<T> | NextCallback<T>): Observer<T> {
  if (isNextCallback(observer)) {
    observer = {
      next: observer,
      error: noop,
      complet: noop
    };
  }
  return observer;
}

function isNextCallback<T>(
  observer: Observer<T> | NextCallback<T>
): observer is NextCallback<T> {
  return typeof observer === 'function';
}

function noop(): void {}
