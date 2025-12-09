import { createAccessControl } from "better-auth/plugins/access";

export const ac = createAccessControl({
	team: ["create", "update", "delete"],
	organization: ["update"],
});

export const member = ac.newRole({
	organization: ["update"],
});

export const admin = ac.newRole({
	team: ["create", "update", "delete"],
});

export const owner = ac.newRole({
	team: ["create", "update", "delete"],
	organization: ["update"],
});
