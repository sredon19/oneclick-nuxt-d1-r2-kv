import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements } from 'better-auth/plugins/organization/access'

const statements = {
    ...defaultStatements,
} as const

export const orgAccessControl = createAccessControl(statements)

export const ownerRole = orgAccessControl.newRole({
    organization: ['update', 'delete'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    team: ['create', 'update', 'delete'],
    ac: ['create', 'read', 'update', 'delete'],
})

export const adminRole = orgAccessControl.newRole({
    organization: ['update'],
    member: ['create', 'update', 'delete'],
    invitation: ['create', 'cancel'],
    team: ['create', 'update', 'delete'],
    ac: ['create', 'read', 'update', 'delete'],
})

export const memberRole = orgAccessControl.newRole({
    organization: [],
    member: [],
    invitation: [],
    team: [],
    ac: ['read'],
})
