type Listener<T> = (newValue: T, oldValue: T) => void;

export class ReactiveVariable<T> {
    private _value: T;
    private listeners: Listener<T>[] = [];

    constructor(initialValue: T) {
        this._value = initialValue;
    }

    get value(): T {
        return this._value;
    }

    set value(newValue: T) {
        if (newValue !== this._value) {
            const oldValue = this._value;
            this._value = newValue;
            this.notifyListeners(newValue, oldValue);
        }
    }

    subscribe(listener: Listener<T>): void {
        this.listeners.push(listener);
    }

    unsubscribe(listener: Listener<T>): void {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    private notifyListeners(newValue: T, oldValue: T): void {
        this.listeners.forEach(listener => listener(newValue, oldValue));
    }
}