import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
    ...defaultStatements, 
    project: ["create", "share", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

const admin = ac.newRole({
    project: ['create', 'update'],
    ...adminAc.statements,
})

// basic user role with minimal permissions
const user = ac.newRole({})

// Marketplace seller — a capability layered on top of whatever base role a
// user already has (authRole is comma-separated: "user,seller"), not a
// replacement for it. No dedicated statements yet; requireSeller()/the
// seller.ts route middleware gate on role membership directly, the same way
// admin.ts does for "admin", rather than through ac permission checks.
const seller = ac.newRole({})

// an example custom role (Role object)
const myCustomRole = ac.newRole({
    // custom permissions for this role can be added here
})

export { ac, admin, user, seller, myCustomRole }