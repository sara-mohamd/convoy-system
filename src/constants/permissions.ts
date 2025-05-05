// All permissions used throughout the codebase
export const PERMISSIONS = {
    // Committee
    createCommittee: 'createCommittee',
    updateCommittee: 'updateCommittee',
    manageCommitteeMembers: 'manageCommitteeMembers',

    // Auth/User
    activateUser: 'activateUser',
    changeUserRole: 'changeUserRole',

    // Convoy
    createConvoy: 'createConvoy',
    updateConvoy: 'updateConvoy',
    manageConvoyParticipants: 'manageConvoyParticipants',

    // Role
    viewRoles: 'viewRoles',
    createRole: 'createRole',
    updateRole: 'updateRole',
    deleteRole: 'deleteRole',
    viewPermissions: 'viewPermissions',
    createPermission: 'createPermission',

    // Volunteer/Applications
    viewApplications: 'viewApplications',
    viewConvoyApplications: 'viewConvoyApplications',
    manageApplications: 'manageApplications',
    blockVolunteer: 'blockVolunteer',

    // Village
    manageVillages: 'manageVillages',
    recordVillageData: 'recordVillageData',
} as const;

// Type for permissions
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const PERMISSION_DESCRIPTIONS: Record<keyof typeof PERMISSIONS, string> = {
    createCommittee: "Allows creating a new committee.",
    updateCommittee: "Allows updating committee details.",
    manageCommitteeMembers: "Allows adding or removing members from a committee.",
    activateUser: "Allows activating a user account.",
    changeUserRole: "Allows changing a user's role.",
    createConvoy: "Allows creating a new convoy.",
    updateConvoy: "Allows updating convoy details.",
    manageConvoyParticipants: "Allows managing participants in a convoy.",
    viewRoles: "Allows viewing all roles.",
    createRole: "Allows creating a new role.",
    updateRole: "Allows updating an existing role.",
    deleteRole: "Allows deleting a role.",
    viewPermissions: "Allows viewing all permissions.",
    createPermission: "Allows creating a new permission.",
    viewApplications: "Allows viewing all volunteer applications.",
    viewConvoyApplications: "Allows viewing applications for a specific convoy.",
    manageApplications: "Allows managing (approve/reject) volunteer applications.",
    blockVolunteer: "Allows blocking a volunteer from participating.",
    manageVillages: "Allows creating or updating villages.",
    recordVillageData: "Allows recording data for a village."
};
