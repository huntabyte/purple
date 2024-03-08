export class Ref<T> {
	value = $state() as T;

	constructor(value: T) {
		this.value = value;
	}
}

export function ref<T>(initialValue: T) {
	return new Ref(initialValue);
}
