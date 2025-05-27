import { AsyncSubject } from './async-subject';
import { Observer, Observable } from '../observable';

describe(AsyncSubject.name, () => {
	it('should be an Observer which can be given to Observable.subscribe', () => {
		// Arrange
		const source = new Observable<number>((observer) => {
			[1, 2, 3, 4, 5].forEach((value) => observer.next(value));
			observer.complete();
		});
		const subject = new AsyncSubject<number>();
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
		expect(observer.next).toHaveBeenCalledOnceWith(5);
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
		const subject = new AsyncSubject<number>();

		// Act
		const observable = Observable.from(subject);
		observable.subscribe(observer);
		subject.next(1);
		subject.next(2);
		subject.next(3);
		subject.complete();

		// Assert
		expect(observable).toBeInstanceOf(Observable);
		expect(observable).not.toBeInstanceOf(AsyncSubject);
		expect(observer.error).not.toHaveBeenCalled();
		expect(observer.next).toHaveBeenCalledOnceWith(3);
		expect(observer.complete).toHaveBeenCalledOnceWith();
		expect(observer.finally).toHaveBeenCalledOnceWith();
	});

	describe('subscribe', () => {
		it('should only emit the last value on complete', () => {
			// Arrange
			const subject = new AsyncSubject<string>();
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'next',
				'complete',
			]);

			// Act
			subject.subscribe(observer);
			subject.next('foo');
			subject.next('bar');
			subject.complete();

			// Assert
			expect(observer.next).toHaveBeenCalledOnceWith('bar');
			expect(observer.complete).toHaveBeenCalledOnceWith();
		});

		it('should not emit if no value is nexted', () => {
			// Arrange
			const subject = new AsyncSubject<string>();
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'next',
				'complete',
			]);

			// Act
			subject.subscribe(observer);
			subject.complete();

			// Assert
			expect(observer.next).not.toHaveBeenCalled();
			expect(observer.complete).toHaveBeenCalledOnceWith();
		});

		it('should emit last value to late subscribers', () => {
			// Arrange
			const subject = new AsyncSubject<string>();
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'next',
				'complete',
			]);

			// Act
			subject.next('foo');
			subject.next('bar');
			subject.complete();
			subject.subscribe(observer);

			// Assert
			expect(observer.next).toHaveBeenCalledOnceWith('bar');
			expect(observer.complete).toHaveBeenCalledOnceWith();
		});

		it('should not emit to late subscribers if no value was nexted', () => {
			// Arrange
			const subject = new AsyncSubject<string>();
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'next',
				'complete',
			]);

			// Act
			subject.complete();
			subject.subscribe(observer);

			// Assert
			expect(observer.next).not.toHaveBeenCalled();
			expect(observer.complete).toHaveBeenCalledOnceWith();
		});
	});

	describe('next', () => {
		it('should not emit values until complete', () => {
			// Arrange
			const subject = new AsyncSubject<string>();
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'next',
			]);
			subject.subscribe(observer);

			// Act
			subject.next('foo');
			subject.next('bar');

			// Assert
			expect(observer.next).not.toHaveBeenCalled();
		});
	});

	describe('error', () => {
		it('should pass through this subject', () => {
			// Arrange
			const error = new Error('test error');
			const subject = new AsyncSubject<string>();
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
			expect(observer.next).not.toHaveBeenCalled();
			expect(observer.error).toHaveBeenCalledOnceWith(error);
			expect(observer.complete).not.toHaveBeenCalled();
			expect(observer.finally).toHaveBeenCalledOnceWith();
		});

		it('should notify late subscribers', () => {
			// Arrange
			const error = new Error('test error');
			const subject = new AsyncSubject<string>();
			const observer = jasmine.createSpyObj<Observer<string>>('observer', [
				'error',
				'next',
			]);

			// Act
			subject.next('foo');
			subject.error(error);
			subject.subscribe(observer);

			// Assert
			expect(observer.next).not.toHaveBeenCalled();
			expect(observer.error).toHaveBeenCalledOnceWith(error);
		});
	});

	describe('complete', () => {
		it('should notify subscribers', () => {
			// Arrange
			const subject = new AsyncSubject<string>();
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
			const subject = new AsyncSubject<string>();
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
			const subject = new AsyncSubject<string>();

			// Act
			const observable1 = Observable.from(subject);
			const observable2 = Observable.from(subject);

			// Assert
			expect(observable1).toBe(observable2);
		});

		it('should create a new observable multiple times for different subjects', () => {
			// Arrange
			const subject1 = new AsyncSubject<string>();
			const subject2 = new AsyncSubject<string>();

			// Act
			const observable1 = Observable.from(subject1);
			const observable2 = Observable.from(subject2);

			// Assert
			expect(observable1).not.toBe(observable2);
		});
	});
});
