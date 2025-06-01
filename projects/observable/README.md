# @xander/observable

A set of tooling that encapsulates the [Observer pattern](https://en.wikipedia.org/wiki/Observer_pattern) in JavaScript taking inspiration from [RxJS](https://rxjs.dev/)

## Build

Run `ng build observable` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

Go to the project folder `cd .\projects\observable\` and run `npx jsr publish`.

## Running unit tests

Run `ng test observable` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Example

```ts
import { Observable } from '@xander/observable';

const observable = new Observable<0>((observer) => {
	// Note that this logic is invoked for every new subscribe action.

	// If the observer is already aborted, there's no work to do.
	if (observer.signal.aborted) return;

	// Create a timeout as our producer to next a value after 1 second.
	const producer = setTimeout(() => {
		// Next the value to the observer
		observer.next(0);
		// The producer is done, notify complete
		observer.complete();
	}, 1000);

	// Add an abort listener to handle unsubscription by canceling the producer
	observer.signal.addEventListener('abort', () => clearTimeout(producer), {
		once: true,
	});
});
```

# Glossary And Semantics

When discussing and documenting observables, it's important to have a common language and a known set of rules around what is going on. This document is an attempt to standardize these things so we can try to control the language in our docs, and hopefully other publications about this library, so we can discuss reactive programming with this library on consistent terms.

While not all of the documentation for this library reflects this terminology, it is a goal of the team to ensure it does, and to ensure the language and names around the library use this document as a source of truth and unified language.

## Major Entities

There are high level entities that are frequently discussed. It's important to define them separately from other lower-level concepts, because they relate to the nature of observable.

### Consumer

The code that is subscribing to the [observable](https://jsr.io/@xander/observable/doc/~/Observable). This is whoever is being notified of [producer](#producer) notifications.

### Producer

Any system or thing that is the source of values that are being pushed out of the observable subscription to the [consumer](#consumer). This can be a wide variety of things, from a `Promise` to a simple iteration over an `Array`. The producer is most often created during the [subscribe](#subscribe) action, and therefor "owned" by a [subscription](#subscription) in a one-to-one way resulting in a [unicast](#unicast), but that is not always the case. A producer may be shared between many subscriptions, if it is created outside of the [subscribe](#subscribe) action, in which case it is one-to-many, resulting in a [multicast](#multicast). This manifested as a [producer observer](#producerobserver)

### Subscription

A contract where a [consumer](#consumer) is [observing](#observation) values pushed by a [producer](#producer). The subscription, is an ongoing process that amounts to the function of the observable from the [consumer](#consumer)'s perspective. Subscription starts the moment a [subscribe](#subscribe) action is initiated, even before the [subscribe](#subscribe) action is finished.

## Major Actions

There are specific actions and events that occur between major entities in the library that need to be defined. These major actions are the highest level events that occur within various parts of the library.

### Observation

A [consumer](#consumer) reacting to [producer](#producer) notifications. This can only happen _during_ [subscription](#subscription).

### Observation Chain

When an [observable](https://jsr.io/@xander/observable/doc/~/Observable) uses another [observable](https://jsr.io/@xander/observable/doc/~/Observable) as a [producer](#producer), an "observation chain" is set up. That is a chain of [observation](#observation) such that multiple [observers](#observer) are notifying each other in a unidirectional way toward the final [consumer](#consumer).

## Major Concepts

Some of what we discuss is conceptual. These are mostly common traits of behaviors that can manifest in observables or in push-based reactive systems.

### Multicast

The act of one [producer](#producer) being [observed](#observation) by **many** [consumers](#consumer).

### Unicast

The act of one [producer](#producer) being [observed](#observation) by **only one** [consumer](#consumer). An observable is "unicast" when it only connects one [producer](#producer) to one [consumer](#consumer). Unicast doesn't necessarily mean ["cold"](#cold).

### Cold

An observable is "cold" when it creates a new [producer](#producer) during [subscribe](#subscribe) for every new [subscription](#subscription). As a result, "cold" observables are _always_ [unicast](#unicast), being one [producer](#producer) [observed](#observation) by one [consumer](#consumer). Cold observables can be made [hot](#hot) but not the other way around.

### Hot

An observable is "hot", when its [producer](#producer) was created outside of the context of the [subscribe](#subscribe) action. This means that the "hot" observable is almost always [multicast](#multicast). It is possible that a "hot" observable is still _technically_ unicast, if it is engineered to only allow one [subscription](#subscription) at a time, however, there is no straightforward mechanism for this in the library, and the scenario is an unlikely one. For the purposes of discussion, all "hot" observables can be assumed to be [multicast](#multicast). Hot observables cannot be made [cold](#cold).

### Push

[Observables](https://jsr.io/@xander/observable/doc/~/Observable) are a push-based type. That means rather than having the [consumer](#consumer) call a function or perform some other action to get a value, the [consumer](#consumer) receives values as soon as the [producer](#producer) has produced them, via a registered [next](#next) handler.

### Pull

Pull-based systems are the opposite of [push](#push)-based. In a pull-based type or system, the [consumer](#consumer) must request each value the [producer](#producer) has produced manually, perhaps long after the [producer](#producer) has actually done so. Examples of such systems are [Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function) and [Iterators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)

## Minor Entities

### Source

An [observable](https://jsr.io/@xander/observable/doc/~/Observable) that will supply values to another [observable](https://jsr.io/@xander/observable/doc/~/Observable). This [source](#source), will be the [producer](#producer) for the resulting [observable](https://jsr.io/@xander/observable/doc/~/Observable) and all of its [subscriptions](#subscriptions). Sources may generally be any type of observable.

### Notifier

An [observable](https://jsr.io/@xander/observable/doc/~/Observable) that is being used to notify another [observable](https://jsr.io/@xander/observable/doc/~/Observable) that it needs to perform some action. The action should only occur on a [next](#next) and never on [error](#error), [complete](#complete), or [finally](#finally).

## Other Concepts

### Unhandled Errors

An "unhandled error" is any [error](#error) that is not handled by a [consumer](#consumer)-provided function, which is generally provided during the [subscribe](#subscribe) action. If no error handler was provided, the library will assume the error is "unhandled" and rethrow the error on a new callstack to prevent ["producer interference"](#producer-interference).

### Producer Interference

[Producer](#producer) interference happens when an error is allowed to unwind the library's callstack during notification. When this happens, the error could break things like for-loops in [upstream](#upstream-and-downstream) [sources](#source) that are notifying [consumers](#consumer) during a [multicast](#multicast). That would cause the other [consumers](#consumer) in that [multicast](#multicast) to suddenly stop receiving values without logical explanation. The library goes out of its way to prevent producer interference by ensuring that all unhandled errors are thrown on a separate callstack.
