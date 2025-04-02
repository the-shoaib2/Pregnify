/**
 * @fileoverview Dynamic role and permission management system
 * @module constants/roles
 */

/**
 * @description User role values
 * @type {Object.<string, string>}
 */
export const USER_DEFINITIONS = {
    ALPHA: 'SUPER_ADMIN',
    BETA: 'ADMIN',
    GAMMA: 'DOCTOR',
    DELTA: 'PATIENT',
    EPSILON: 'GUEST',
    ZETA: 'NURSE',
    THETA: 'MODERATOR',
    IOTA: 'RESEARCHER',
    KAPPA: 'PHARMACIST',
    LAMBDA: 'SUPPORT_STAFF',
    MU: 'LAB_TECHNICIAN',
    NU: 'ACCOUNTANT'
};

/**
 * @description Base role definitions with metadata
 * @type {Object.<string, RoleDefinition>}
 */
export const ROLE_DEFINITIONS = {
    ALPHA: {
        id: USER_DEFINITIONS.ALPHA,
        name: 'Super Administrator',
        level: 1,
        description: 'Highest level system administrator with complete control',
        access: 'Full system access',
        category: 'SYSTEM',
        inherits: [],
        permissions: ['*'],
        metadata: {
            canDelegate: true,
            canAudit: true,
            isSensitive: true,
            systemLevel: true,
            canManageRoles: true
        }
    },
    BETA: {
        id: USER_DEFINITIONS.BETA,
        name: 'Administrator',
        level: 2,
        description: 'System administrator with high-level management access',
        access: 'System management',
        category: 'SYSTEM',
        inherits: ['THETA'],
        permissions: [
            'manage_users',
            'manage_settings',
            'view_analytics',
            'manage_roles',
            'manage_permissions',
            'audit_system',
            'manage_security'
        ],
        metadata: {
            canDelegate: true,
            canAudit: true,
            isSensitive: true,
            departmentAccess: true
        }
    },
    GAMMA: {
        id: USER_DEFINITIONS.GAMMA,
        name: 'Medical Doctor',
        level: 3,
        description: 'Healthcare provider with full medical access',
        access: 'Medical care',
        category: 'MEDICAL',
        inherits: ['ZETA'],
        permissions: [
            'write_prescriptions',
            'diagnose_patients',
            'order_tests',
            'manage_treatments',
            'access_full_records',
            'create_medical_reports',
            'refer_patients'
        ],
        metadata: {
            requiresMedicalLicense: true,
            canPrescribe: true,
            clinicalAccess: true,
            specialtyRequired: true
        }
    },
    DELTA: {
        id: USER_DEFINITIONS.DELTA,
        name: 'Patient',
        level: 7,
        description: 'Healthcare service recipient',
        access: 'Personal health',
        category: 'CLIENT',
        inherits: [],
        permissions: [
            'view_own_records',
            'book_appointments',
            'request_prescriptions',
            'message_providers',
            'manage_personal_info',
            'access_portal'
        ],
        metadata: {
            isClient: true,
            needsConsent: true,
            canAccessPortal: true
        }
    },
    EPSILON: {
        id: USER_DEFINITIONS.EPSILON,
        name: 'Guest User',
        level: 8,
        description: 'Limited access temporary user',
        access: 'Public access',
        category: 'PUBLIC',
        inherits: [],
        permissions: [
            'view_public_content',
            'register_account',
            'contact_support'
        ],
        metadata: {
            isTemporary: true,
            limitedAccess: true
        }
    },
    ZETA: {
        id: USER_DEFINITIONS.ZETA,
        name: 'Nurse',
        level: 4,
        description: 'Healthcare support provider',
        access: 'Patient care',
        category: 'MEDICAL',
        inherits: ['MU'],
        permissions: [
            'update_patient_records',
            'administer_medication',
            'record_vitals',
            'assist_procedures',
            'manage_care_plans',
            'access_medical_records'
        ],
        metadata: {
            requiresNurseLicense: true,
            clinicalAccess: true,
            canAdministerMeds: true
        }
    },
    THETA: {
        id: USER_DEFINITIONS.THETA,
        name: 'System Moderator',
        level: 5,
        description: 'Content and user moderator',
        access: 'Moderation',
        category: 'SYSTEM',
        inherits: [],
        permissions: [
            'moderate_content',
            'manage_reports',
            'review_flags',
            'manage_comments',
            'suspend_users',
            'manage_notifications'
        ],
        metadata: {
            canModerate: true,
            accessAuditLogs: true
        }
    },
    IOTA: {
        id: USER_DEFINITIONS.IOTA,
        name: 'Medical Researcher',
        level: 4,
        description: 'Clinical research professional',
        access: 'Research data',
        category: 'RESEARCH',
        inherits: [],
        permissions: [
            'access_research_data',
            'conduct_studies',
            'analyze_data',
            'manage_trials',
            'export_anonymized_data',
            'publish_findings'
        ],
        metadata: {
            researchAccess: true,
            requiresEthicsApproval: true,
            dataAccessLevel: 'anonymized'
        }
    },
    KAPPA: {
        id: USER_DEFINITIONS.KAPPA,
        name: 'Pharmacist',
        level: 4,
        description: 'Pharmacy management professional',
        access: 'Pharmacy',
        category: 'MEDICAL',
        inherits: [],
        permissions: [
            'manage_medications',
            'verify_prescriptions',
            'dispense_medications',
            'manage_inventory',
            'consult_patients',
            'access_drug_database'
        ],
        metadata: {
            requiresPharmLicense: true,
            canDispenseMeds: true,
            inventoryAccess: true
        }
    },
    LAMBDA: {
        id: USER_DEFINITIONS.LAMBDA,
        name: 'Support Staff',
        level: 6,
        description: 'Customer support representative',
        access: 'Support',
        category: 'SUPPORT',
        inherits: [],
        permissions: [
            'handle_tickets',
            'respond_inquiries',
            'access_faqs',
            'escalate_issues',
            'manage_support_resources',
            'view_basic_user_info'
        ],
        metadata: {
            supportAccess: true,
            canEscalate: true
        }
    },
    MU: {
        id: USER_DEFINITIONS.MU,
        name: 'Laboratory Technician',
        level: 5,
        description: 'Laboratory operations specialist',
        access: 'Laboratory',
        category: 'MEDICAL',
        inherits: [],
        permissions: [
            'manage_lab_tests',
            'process_samples',
            'record_results',
            'maintain_equipment',
            'manage_lab_inventory',
            'handle_specimens'
        ],
        metadata: {
            labAccess: true,
            requiresLabCert: true,
            biosafetyLevel: 2
        }
    },
    NU: {
        id: USER_DEFINITIONS.NU,
        name: 'Financial Accountant',
        level: 5,
        description: 'Financial operations manager',
        access: 'Finance',
        category: 'FINANCE',
        inherits: [],
        permissions: [
            'manage_billing',
            'process_payments',
            'generate_reports',
            'manage_invoices',
            'handle_insurance',
            'audit_finances'
        ],
        metadata: {
            financialAccess: true,
            canProcessPayments: true,
            requiresAccounting: true
        }
    }
};

/**
 * @description Permission categories with their scopes
 * @type {Object.<string, PermissionCategory>}
 */
export const PERMISSION_CATEGORIES = {
    SYSTEM: {
        name: 'System',
        permissions: [
            'manage_users',
            'manage_settings',
            'view_analytics',
            'manage_roles'
        ],
        scope: 'GLOBAL'
    },
    MEDICAL: {
        name: 'Medical',
        permissions: [
            'write_prescriptions',
            'view_medical_records',
            'manage_patients'
        ],
        scope: 'DEPARTMENT'
    },
    BILLING: {
        name: 'Billing',
        permissions: [
            'process_payments',
            'manage_invoices',
            'view_financial_reports'
        ],
        scope: 'ORGANIZATION'
    }
    // ... other categories
};

/**
 * @description Role builder for creating dynamic roles
 */
export class RoleBuilder {
    constructor(baseRole) {
        this.role = { ...ROLE_DEFINITIONS[baseRole] };
    }

    addPermissions(permissions) {
        this.role.permissions = [...this.role.permissions, ...permissions];
        return this;
    }

    inherit(roleId) {
        const parentRole = ROLE_DEFINITIONS[roleId];
        if (parentRole) {
            this.role.inherits.push(roleId);
            this.role.permissions = [
                ...this.role.permissions,
                ...parentRole.permissions
            ];
        }
        return this;
    }

    setMetadata(metadata) {
        this.role.metadata = { ...this.role.metadata, ...metadata };
        return this;
    }

    build() {
        return this.role;
    }
}

/**
 * @description Permission checker with inheritance support
 */
export class PermissionChecker {
    constructor(roleId) {
        this.role = ROLE_DEFINITIONS[roleId];
        this.permissions = new Set(this.role.permissions);
        this._loadInheritedPermissions();
    }

    _loadInheritedPermissions() {
        this.role.inherits.forEach(parentId => {
            const parentRole = ROLE_DEFINITIONS[parentId];
            parentRole.permissions.forEach(perm => this.permissions.add(perm));
        });
    }

    can(permission) {
        return this.permissions.has('*') || this.permissions.has(permission);
    }

    hasLevel(minimumLevel) {
        return this.role.level <= minimumLevel;
    }

    isInCategory(category) {
        return this.role.category === category;
    }
}

/**
 * @description Dynamic role generator for different systems
 */
export class RoleSystem {
    static createHealthcareRoles() {
        return {
            DOCTOR: new RoleBuilder('DOCTOR')
                .inherit('BASIC_MEDICAL')
                .addPermissions(['prescribe_medication'])
                .build(),
            NURSE: new RoleBuilder('BASIC_MEDICAL')
                .addPermissions(['update_patient_records'])
                .build()
            // ... other healthcare roles
        };
    }

    static createEducationRoles() {
        return {
            TEACHER: new RoleBuilder('EDUCATOR')
                .addPermissions(['create_courses'])
                .build(),
            STUDENT: new RoleBuilder('LEARNER')
                .addPermissions(['view_courses'])
                .build()
            // ... other education roles
        };
    }
}

/**
 * @description Helper functions for role management
 */
export const RoleUtils = {
    isRoleHigherOrEqual: (roleA, roleB) => {
        const roleADef = ROLE_DEFINITIONS[roleA];
        const roleBDef = ROLE_DEFINITIONS[roleB];
        return roleADef.level <= roleBDef.level;
    },

    getRolePermissions: (roleId) => {
        const checker = new PermissionChecker(roleId);
        return Array.from(checker.permissions);
    },

    validateRole: (roleId) => {
        return !!ROLE_DEFINITIONS[roleId];
    },

    getRoleMetadata: (roleId) => {
        return ROLE_DEFINITIONS[roleId]?.metadata || {};
    }
};

export default {
    USER_DEFINITIONS,
    ROLE_DEFINITIONS,
    PERMISSION_CATEGORIES,
    RoleBuilder,
    PermissionChecker,
    RoleSystem,
    RoleUtils
}; 