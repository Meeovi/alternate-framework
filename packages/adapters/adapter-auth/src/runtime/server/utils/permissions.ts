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

// an example custom role (Role object)
const myCustomRole = ac.newRole({
    // custom permissions for this role can be added here
})

export { ac, admin, user, myCustomRole }