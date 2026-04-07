// Shared type exports for layers. Expand these with concrete types over time.
export type UserLogin = any;
export type DraftItem = any;
export type DraftKey = string | number;
export type DraftMap = Record<string, DraftItem>;
export type GroupedNotifications = any;
export type GroupedLikeNotifications = any;
export type GroupedAccountLike = any;
export type NotificationSlot = any;
export type CommonRouteTabOption = any;
export type PaginatorState = any;
export type BuildInfo = any;
export type ErrorDialogData = any;
export type ElkTranslationStatus = any;

export type Overwrite<T, U> = Omit<T, keyof U> & U;
export type Mutable<T> = {-readonly [P in keyof T]: T[P] } & T;
