export type PermissionCheck = (roles: readonly string[]) => boolean;
export declare function usePermissions(): {
    roles: import("vue").ComputedRef<readonly string[]>;
    can: (check: PermissionCheck) => boolean;
    hasRole: (role: string) => boolean;
};
//# sourceMappingURL=usePermissions.d.ts.map