import { createAuthClient } from 'better-auth/vue'
import { organizationClient } from 'better-auth/client/plugins'
import { adminRole, memberRole, orgAccessControl, ownerRole } from '../../shared/auth/access'

export function useAuthClient() {
	const url = useRequestURL()
	return createAuthClient({
		baseURL: url.origin,
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
}
