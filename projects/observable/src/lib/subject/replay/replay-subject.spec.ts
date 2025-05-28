import { ReplaySubject } from './replay-subject';
import { Observer, Observable } from '../../observable';

describe(ReplaySubject.name, () => {
	it('should be an Observer which can be given to Observable.subscribe', () => {
		// Arrange
		const source = new Observable<number>((observer) => {
			[1, 2, 3, 4, 5].forEach((value) => observer.next(value));
			observer.complete();
		});
		const subject = new ReplaySubject<number>(3);
		const observer = jasmine.createSpyObj<Observer<number>>('observer', [
			'next',
			'complete',
			'error',
			'finally',
		]);

		// Act
		subject.subscribe(observer);
		source.subscribe(subject);

		// Assert
		expect(observer.next.calls.allArgs()).toEqual([[1], [2], [3], [4], [5]]);
		expect(observer.complete).toHaveBeenCalledOnceWith();
		expect(observer.error).not.toHaveBeenCalled();
		expect(observer.finally).toHaveBeenCalledOnceWith();
	});

	it('should be an InteropObservable that can be past to Observable.from', () => {
		// Arrange
		const observer = jasmine.createSpyObj<Observer<number>>('observer', [
			'next',
			'complete',
			'error',
			'finally',
		]);
		const subject = new ReplaySubject<number>();

		// Act
		const observable = Observable.from(subject);
		subject.next(1);
		subject.next(2);
		subject.next(3);
		subject.complete();
		observable.subscribe(observer);

		// Assert
		expect(observable).toBeInstanceOf(Observable);
		expect(observable).not.toBeInstanceOf(ReplaySubject);
		expect(observer.error).not.toHaveBeenCalled();
		expect(observer.next.calls.allArgs()).toEqual([[1], [2], [3]]);
		expect(observer.complete).toHaveBeenCalledOnceWith();
		expect(observer.finally).toHaveBeenCalledOnceWith();
	});

	describe('subscribe', () => {
		it('should emit buffered values to subscribers', () => {
			// Arrange
			const subject = new ReplaySubject<string>(2);
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'next',
				'complete',
			]);

			// Act
			subject.next('first');
			subject.next('second');
			subject.next('third');
			subject.subscribe(observer);

			// Assert
			expect(observer.next.calls.allArgs()).toEqual([['second'], ['third']]);
		});

		it('should emit all values when buffer size is infinite', () => {
			// Arrange
			const subject = new ReplaySubject<string>();
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'next',
				'complete',
			]);

			// Act
			subject.next('first');
			subject.next('second');
			subject.next('third');
			subject.subscribe(observer);

			// Assert
			expect(observer.next.calls.allArgs()).toEqual([
				['first'],
				['second'],
				['third'],
			]);
		});

		it('should emit buffered values to late subscribers', () => {
			// Arrange
			const subject = new ReplaySubject<string>(2);
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'next',
				'complete',
			]);

			// Act
			subject.next('first');
			subject.next('second');
			subject.complete();
			subject.subscribe(observer);

			// Assert
			expect(observer.next.calls.allArgs()).toEqual([['first'], ['second']]);
			expect(observer.complete).toHaveBeenCalledOnceWith();
		});
	});

	describe('next', () => {
		it('should emit values to subscribers', () => {
			// Arrange
			const subject = new ReplaySubject<string>(2);
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'next',
			]);
			subject.subscribe(observer);

			// Act
			subject.next('foo');
			subject.next('bar');

			// Assert
			expect(observer.next.calls.allArgs()).toEqual([['foo'], ['bar']]);
		});

		it('should store values for late subscribers', () => {
			// Arrange
			const subject = new ReplaySubject<string>(2);
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'next',
			]);

			// Act
			subject.next('foo');
			subject.next('bar');
			subject.subscribe(observer);

			// Assert
			expect(observer.next.calls.allArgs()).toEqual([['foo'], ['bar']]);
		});
	});

	describe('error', () => {
		it('should pass through this subject', () => {
			// Arrange
			const error = new Error('test error');
			const subject = new ReplaySubject<string>(2);
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'error',
				'complete',
				'finally',
				'next',
			]);
			subject.subscribe(observer);

			// Act
			subject.next('foo');
			subject.error(error);

			// Assert
			expect(observer.next).toHaveBeenCalledOnceWith('foo');
			expect(observer.error).toHaveBeenCalledOnceWith(error);
			expect(observer.complete).not.toHaveBeenCalled();
			expect(observer.finally).toHaveBeenCalledOnceWith();
		});

		it('should notify late subscribers', () => {
			// Arrange
			const error = new Error('test error');
			const subject = new ReplaySubject<string>(2);
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'error',
				'next',
			]);

			// Act
			subject.next('foo');
			subject.error(error);
			subject.subscribe(observer);

			// Assert
			expect(observer.next).toHaveBeenCalledOnceWith('foo');
			expect(observer.error).toHaveBeenCalledOnceWith(error);
		});
	});

	describe('complete', () => {
		it('should notify subscribers', () => {
			// Arrange
			const subject = new ReplaySubject<string>(2);
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'complete',
				'next',
				'finally',
			]);
			subject.subscribe(observer);

			// Act
			subject.next('foo');
			subject.complete();

			// Assert
			expect(observer.next).toHaveBeenCalledOnceWith('foo');
			expect(observer.complete).toHaveBeenCalledOnceWith();
			expect(observer.finally).toHaveBeenCalledOnceWith();
		});

		it('should notify late subscribers', () => {
			// Arrange
			const subject = new ReplaySubject<string>(2);
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'complete',
				'next',
			]);

			// Act
			subject.next('foo');
			subject.complete();
			subject.subscribe(observer);

			// Assert
			expect(observer.next).toHaveBeenCalledOnceWith('foo');
			expect(observer.complete).toHaveBeenCalledOnceWith();
		});
	});

	describe('Observable.from', () => {
		it('should not create a new observable multiple times for the same subject', () => {
			// Arrange
			const subject = new ReplaySubject<string>();

			// Act
			const observable1 = Observable.from(subject);
			const observable2 = Observable.from(subject);

			// Assert
			expect(observable1).toBe(observable2);
		});

		it('should create a new observable multiple times for different subjects', () => {
			// Arrange
			const subject1 = new ReplaySubject<string>();
			const subject2 = new ReplaySubject<string>();

			// Act
			const observable1 = Observable.from(subject1);
			const observable2 = Observable.from(subject2);

			// Assert
			expect(observable1).not.toBe(observable2);
		});
	});
});
