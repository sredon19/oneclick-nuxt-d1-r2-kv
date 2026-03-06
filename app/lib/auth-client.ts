import { createAuthClient } from 'better-auth/vue'
import { organizationClient } from 'better-auth/client/plugins'
import { adminRole, memberRole, orgAccessControl, ownerRole } from '../../shared/auth/access'

export const authClient = createAuthClient({
	plugins: [
		organizationClient({
			ac: orgAccessControl,
			roles: {
				owner: ownerRole,
				admin: adminRole,
				member: memberRole,
			},
		}),
	],
})
