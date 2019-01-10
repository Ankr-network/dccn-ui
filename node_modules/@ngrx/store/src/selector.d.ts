import { Selector } from './models';
export declare type AnyFn = (...args: any[]) => any;
export declare type MemoizedProjection = {
    memoized: AnyFn;
    reset: () => void;
};
export declare type MemoizeFn = (t: AnyFn) => MemoizedProjection;
export interface MemoizedSelector<State, Result> extends Selector<State, Result> {
    release(): void;
    projector: AnyFn;
}
export declare function isEqualCheck(a: any, b: any): boolean;
export declare function defaultMemoize(t: AnyFn, isEqual?: typeof isEqualCheck): MemoizedProjection;
export declare function createSelector<State, S1, Result>(s1: Selector<State, S1>, projector: (S1: S1) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, Result>(selectors: [Selector<State, S1>], projector: (s1: S1) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, S2, Result>(s1: Selector<State, S1>, s2: Selector<State, S2>, projector: (s1: S1, s2: S2) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, S2, Result>(selectors: [Selector<State, S1>, Selector<State, S2>], projector: (s1: S1, s2: S2) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, S2, S3, Result>(s1: Selector<State, S1>, s2: Selector<State, S2>, s3: Selector<State, S3>, projector: (s1: S1, s2: S2, s3: S3) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, S2, S3, Result>(selectors: [Selector<State, S1>, Selector<State, S2>, Selector<State, S3>], projector: (s1: S1, s2: S2, s3: S3) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, S2, S3, S4, Result>(s1: Selector<State, S1>, s2: Selector<State, S2>, s3: Selector<State, S3>, s4: Selector<State, S4>, projector: (s1: S1, s2: S2, s3: S3, s4: S4) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, S2, S3, S4, Result>(selectors: [Selector<State, S1>, Selector<State, S2>, Selector<State, S3>, Selector<State, S4>], projector: (s1: S1, s2: S2, s3: S3, s4: S4) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, S2, S3, S4, S5, Result>(s1: Selector<State, S1>, s2: Selector<State, S2>, s3: Selector<State, S3>, s4: Selector<State, S4>, s5: Selector<State, S5>, projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, S2, S3, S4, S5, Result>(selectors: [Selector<State, S1>, Selector<State, S2>, Selector<State, S3>, Selector<State, S4>, Selector<State, S5>], projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, S2, S3, S4, S5, S6, Result>(s1: Selector<State, S1>, s2: Selector<State, S2>, s3: Selector<State, S3>, s4: Selector<State, S4>, s5: Selector<State, S5>, s6: Selector<State, S6>, projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, S2, S3, S4, S5, S6, Result>(selectors: [Selector<State, S1>, Selector<State, S2>, Selector<State, S3>, Selector<State, S4>, Selector<State, S5>, Selector<State, S6>], projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, S2, S3, S4, S5, S6, S7, Result>(s1: Selector<State, S1>, s2: Selector<State, S2>, s3: Selector<State, S3>, s4: Selector<State, S4>, s5: Selector<State, S5>, s6: Selector<State, S6>, s7: Selector<State, S7>, projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, s7: S7) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, S2, S3, S4, S5, S6, S7, Result>(selectors: [Selector<State, S1>, Selector<State, S2>, Selector<State, S3>, Selector<State, S4>, Selector<State, S5>, Selector<State, S6>, Selector<State, S7>], projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, s7: S7) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, S2, S3, S4, S5, S6, S7, S8, Result>(s1: Selector<State, S1>, s2: Selector<State, S2>, s3: Selector<State, S3>, s4: Selector<State, S4>, s5: Selector<State, S5>, s6: Selector<State, S6>, s7: Selector<State, S7>, s8: Selector<State, S8>, projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, s7: S7, s8: S8) => Result): MemoizedSelector<State, Result>;
export declare function createSelector<State, S1, S2, S3, S4, S5, S6, S7, S8, Result>(selectors: [Selector<State, S1>, Selector<State, S2>, Selector<State, S3>, Selector<State, S4>, Selector<State, S5>, Selector<State, S6>, Selector<State, S7>, Selector<State, S8>], projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, s7: S7, s8: S8) => Result): MemoizedSelector<State, Result>;
export declare function defaultStateFn(state: any, selectors: Selector<any, any>[], memoizedProjector: MemoizedProjection): any;
export declare type SelectorFactoryConfig<T = any, V = any> = {
    stateFn: (state: T, selectors: Selector<any, any>[], memoizedProjector: MemoizedProjection) => V;
};
export declare function createSelectorFactory<T = any, V = any>(memoize: MemoizeFn): (...input: any[]) => Selector<T, V>;
export declare function createSelectorFactory<T = any, V = any>(memoize: MemoizeFn, options: SelectorFactoryConfig<T, V>): (...input: any[]) => Selector<T, V>;
export declare function createFeatureSelector<T>(featureName: string): MemoizedSelector<object, T>;
