import { BehaviorSubject } from './behavior-subject';
import { ConsumerObserver, Observable } from '../observable';

describe(BehaviorSubject.name, () => {
	it('should be an Observer which can be given to Observable.subscribe', () => {
		// Arrange
		const source = new Observable<number>((observer) => {
			[1, 2, 3, 4, 5].forEach((value) => observer.next(value));
			observer.complete();
		});
		const subject = new BehaviorSubject(0);
		const observer = jasmine.createSpyObj<ConsumerObserver<number>>(
			'observer',
			['next', 'complete', 'error', 'finally'],
		);

		// Act
		subject.subscribe(observer);
		source.subscribe(subject);

		// Assert
		expect(observer.next.calls.allArgs()).toEqual([
			[0],
			[1],
			[2],
			[3],
			[4],
			[5],
		]);
		expect(observer.complete).toHaveBeenCalledOnceWith();
		expect(observer.error).not.toHaveBeenCalled();
		expect(observer.finally).toHaveBeenCalledOnceWith();
	});

	it('should be an InteropObservable that can be past to Observable.from', () => {
		// Arrange
		const observer = jasmine.createSpyObj<ConsumerObserver<number>>(
			'observer',
			['next', 'complete', 'error', 'finally'],
		);
		const subject = new BehaviorSubject(0);

		// Act
		const observable = Observable.from(subject);
		observable.subscribe(observer);
		subject.next(1);
		subject.next(2);
		subject.next(3);
		subject.complete();

		// Assert
		expect(observable).toBeInstanceOf(Observable);
		expect(observable).not.toBeInstanceOf(BehaviorSubject);
		expect(observer.next.calls.allArgs()).toEqual([[0], [1], [2], [3]]);
		expect(observer.complete).toHaveBeenCalledOnceWith();
		expect(observer.finally).toHaveBeenCalledOnceWith();
		expect(observer.error).not.toHaveBeenCalled();
	});

	describe('subscribe', () => {
		it('should emit latest value to subscribers', () => {
			// Arrange
			const subject = new BehaviorSubject('initial');
			const observer = jasmine.createSpyObj('observer', ['next', 'complete']);
			subject.next('second');

			// Act
			subject.subscribe(observer);

			// Assert
			expect(observer.next).toHaveBeenCalledOnceWith('second');
		});
		it('should emit latest value to late subscribers the complete', () => {
			// Arrange
			const subject = new BehaviorSubject('initial');
			const observer = jasmine.createSpyObj('observer', ['next', 'complete']);
			subject.next('second');

			// Act
			subject.subscribe(observer);

			// Assert
			expect(observer.next).toHaveBeenCalledOnceWith('second');
		});
	});

	describe('next', () => {
		it('should emit value to subscribers', () => {
			// Arrange
			const subject = new BehaviorSubject('initial');
			const observer = jasmine.createSpyObj<ConsumerObserver<string>>(
				'observer',
				['next'],
			);
			subject.subscribe(observer);

			// Act
			subject.next('foo');

			// Assert
			expect(observer.next.calls.allArgs()).toEqual([['initial'], ['foo']]);
		});

		it('should store value for late subscribers', () => {
			// Arrange
			const subject = new BehaviorSubject('initial');
			const observer = jasmine.createSpyObj<ConsumerObserver<string>>(
				'observer',
				['next'],
			);

			// Act
			subject.next('foo');
			subject.subscribe(observer);

			// Assert
			expect(observer.next).toHaveBeenCalledOnceWith('foo');
		});
	});

	describe('error', () => {
		it('should pass through this subject', () => {
			// Arrange
			const error = new Error('test error');
			const subject = new BehaviorSubject('initial');
			const observer = jasmine.createSpyObj<ConsumerObserver<string>>(
				'observer',
				['error', 'complete', 'finally', 'next'],
			);
			subject.subscribe(observer);

			// Act
			subject.error(error);

			// Assert
			expect(observer.next).toHaveBeenCalledOnceWith('initial');
			expect(observer.error).toHaveBeenCalledOnceWith(error);
			expect(observer.complete).not.toHaveBeenCalled();
			expect(observer.finally).toHaveBeenCalledOnceWith();
		});

		it('should notify late subscribers', () => {
			// Arrange
			const error = new Error('test error');
			const subject = new BehaviorSubject('initial');
			const observer = jasmine.createSpyObj<ConsumerObserver<string>>(
				'observer',
				['error', 'next'],
			);

			// Act
			subject.error(error);
			subject.subscribe(observer);

			// Assert
			expect(observer.next).toHaveBeenCalledOnceWith('initial');
			expect(observer.error).toHaveBeenCalledOnceWith(error);
		});
	});

	describe('complete', () => {
		it('should notify subscribers', () => {
			// Arrange
			const subject = new BehaviorSubject('initial');
			const observer = jasmine.createSpyObj<ConsumerObserver<string>>(
				'observer',
				['complete', 'next', 'finally'],
			);
			subject.subscribe(observer);

			// Act
			subject.complete();

			// Assert
			expect(observer.next).toHaveBeenCalledOnceWith('initial');
			expect(observer.complete).toHaveBeenCalledOnceWith();
			expect(observer.finally).toHaveBeenCalledOnceWith();
		});

		it('should notify late subscribers', () => {
			// Arrange
			const subject = new BehaviorSubject('initial');
			const observer = jasmine.createSpyObj<ConsumerObserver<string>>(
				'observer',
				['complete', 'next'],
			);

			// Act
			subject.complete();
			subject.subscribe(observer);

			// Assert
			expect(observer.next).toHaveBeenCalledOnceWith('initial');
			expect(observer.complete).toHaveBeenCalledOnceWith();
		});
	});

	describe('Observable.from', () => {
		it('should not create a new observable multiple times for the same subject', () => {
			// Arrange
			const subject = new BehaviorSubject('test');

			// Act
			const observable1 = Observable.from(subject);
			const observable2 = Observable.from(subject);

			// Assert
			expect(observable1).toBe(observable2);
		});

		it('should create a new observable multiple times for different subjects', () => {
			// Arrange
			const subject1 = new BehaviorSubject('test1');
			const subject2 = new BehaviorSubject('test2');

			// Act
			const observable1 = Observable.from(subject1);
			const observable2 = Observable.from(subject2);

			// Assert
			expect(observable1).not.toBe(observable2);
		});
	});

	describe('value', () => {
		it('should return current value', () => {
			// Arrange
			const subject = new BehaviorSubject('initial');

			// Act
			const value1 = subject.value;
			subject.next('second');
			const value2 = subject.value;

			// Assert
			expect(value1).toBe('initial');
			expect(value2).toBe('second');
		});
	});
});
