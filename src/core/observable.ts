
import { Nullable } from "../type";

//https://github.com/BabylonJS/Babylon.js/blob/master/src/Misc/observable.ts

/**
 * Represent an Observer registered to a given Observable object.
 */
export class Observer<T> {
  /** @hidden */
  public _willBeUnregistered = false;
  /**
   * Gets or sets a property defining that the observer as to be unregistered after the next notification
   */
  public unregisterOnNextCall = false;

  /**
   * Creates a new observer
   * @param callback defines the callback to call when the observer is notified
   */
  constructor(
    /**
     * Defines the callback to call when the observer is notified
     */
    public callback: (eventData: T) => void
  ) {
  }
}



export class Observable<T> {
  private _observers = new Array<Observer<T>>();

  private _onObserverAdded: Nullable<(observer: Observer<T>) => void> = null;

  /**
   * Creates a new observable
   * @param onObserverAdded defines a callback to call when a new observer is added
   */
  constructor(onObserverAdded?: (observer: Observer<T>) => void) {
    if (onObserverAdded) {
      this._onObserverAdded = onObserverAdded;
    }
  }

  /**
   * Create a new Observer with the specified callback
   * @param callback the callback that will be executed for that Observer
   * @param unregisterOnFirstCall defines if the observer as to be unregistered after the next notification
   * @returns the new observer created for the callback
   */
  public add(callback: (eventData: T) => void,  unregisterOnFirstCall = false): Nullable<Observer<T>> {
    if (!callback) {
      return null;
    }

    var observer = new Observer(callback);
    observer.unregisterOnNextCall = unregisterOnFirstCall;

    this._observers.push(observer);

    if (this._onObserverAdded) {
      this._onObserverAdded(observer);
    }

    return observer;
  }

  /**
   * Create a new Observer with the specified callback and unregister after the next notification
   * @param callback the callback that will be executed for that Observer
   * @returns the new observer created for the callback
   */
  public addOnce(callback: (eventData: T) => void): Nullable<Observer<T>> {
    return this.add(callback, true);
  }

  /**
   * Remove an Observer from the Observable object
   * @param observer the instance of the Observer to remove
   * @returns false if it doesn't belong to this Observable
   */
  public remove(observer: Nullable<Observer<T>>): boolean {
    if (!observer) {
      return false;
    }

    var index = this._observers.indexOf(observer);

    if (index !== -1) {
      this._deferUnregister(observer);
      return true;
    }

    return false;
  }

  private _deferUnregister(observer: Observer<T>): void {
    observer.unregisterOnNextCall = false;
    observer._willBeUnregistered = true;
    setTimeout(() => {
      this._remove(observer);
    }, 0);
  }

  // This should only be called when not iterating over _observers to avoid callback skipping.
  // Removes an observer from the _observer Array.
  private _remove(observer: Nullable<Observer<T>>): boolean {
    if (!observer) {
      return false;
    }

    var index = this._observers.indexOf(observer);

    if (index !== -1) {
      this._observers.splice(index, 1);
      return true;
    }

    return false;
  }

  public notifyObservers(eventData: T): boolean {
    if (this._observers.length === 0) {
      return true;
    }
    for (var obs of this._observers) {
      if (obs._willBeUnregistered) {
        continue;
      }

      obs.callback(eventData);

      if (obs.unregisterOnNextCall) {
        this._deferUnregister(obs);
      }
    }
    return true;
  }

  public notifyObserver(observer: Observer<T>, eventData: T): void {
    observer.callback(eventData);
  }

  public hasObservers(): boolean {
    return this._observers.length > 0;
  }

  public clear(): void {
    this._observers = new Array<Observer<T>>();
    this._onObserverAdded = null;
  }

  public clone(): Observable<T> {
    var result = new Observable<T>();

    result._observers = this._observers.slice(0);

    return result;
  }

}