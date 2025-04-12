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
        description: 'Highest level system administrator with complete control over all features',
        access: 'Full system access',
        category: 'SYSTEM',
        inherits: [],
        permissions: [
            // System Management
            "system:manage",
            "system:configure",
            "system:monitor",
            "system:maintenance",
            "system:backup",
            "system:restore",
            "system:logs",
            "system:audit",
            "system:health",
            "system:performance",
            "system:security",
            "system:updates",
            "system:settings",
            "system:diagnostics",
            "system:recovery",
            
            // User Management
            "users:create",
            "users:read",
            "users:update",
            "users:delete",
            "users:list",
            "users:manage",
            "users:roles",
            "users:permissions",
            "users:status",
            "users:verify",
            "users:block",
            "users:unblock",
            "users:reset_password",
            "users:impersonate",
            "users:audit",
            
            // Role Management
            "roles:create",
            "roles:read",
            "roles:update",
            "roles:delete",
            "roles:list",
            "roles:assign",
            "roles:revoke",
            "roles:permissions",
            "roles:audit",
            
            // Content Management
            "content:create",
            "content:read",
            "content:update",
            "content:delete",
            "content:list",
            "content:approve",
            "content:reject",
            "content:moderate",
            "content:categories",
            "content:tags",
            "content:media",
            "content:templates",
            "content:versions",
            "content:audit",
            
            // Security Management
            "security:manage",
            "security:audit",
            "security:logs",
            "security:alerts",
            "security:incidents",
            "security:policies",
            "security:compliance",
            "security:encryption",
            "security:authentication",
            "security:authorization",
            "security:2fa",
            "security:ip_whitelist",
            "security:session_management",
            "security:password_policies",
            
            // Analytics & Reporting
            "analytics:view",
            "analytics:export",
            "analytics:custom",
            "analytics:dashboard",
            "analytics:reports",
            "analytics:metrics",
            "analytics:trends",
            "analytics:audit",
            
            // Communication
            "communication:manage",
            "communication:email",
            "communication:sms",
            "communication:push",
            "communication:notifications",
            "communication:templates",
            "communication:campaigns",
            "communication:audit",
            
            // Support & Help
            "support:manage",
            "support:tickets",
            "support:faq",
            "support:knowledge_base",
            "support:chat",
            "support:email",
            "support:phone",
            "support:audit",
            
            // Billing & Payments
            "billing:manage",
            "billing:invoices",
            "billing:payments",
            "billing:subscriptions",
            "billing:refunds",
            "billing:plans",
            "billing:coupons",
            "billing:audit",
            
            // API Management
            "api:manage",
            "api:keys",
            "api:endpoints",
            "api:documentation",
            "api:monitoring",
            "api:rate_limits",
            "api:security",
            "api:audit",
            
            // Database Management
            "database:manage",
            "database:backup",
            "database:restore",
            "database:optimize",
            "database:migrate",
            "database:query",
            "database:audit",
            
            // Server Management
            "server:manage",
            "server:monitor",
            "server:scale",
            "server:deploy",
            "server:config",
            "server:security",
            "server:audit",
            
            // Development Tools
            "dev:tools",
            "dev:debug",
            "dev:test",
            "dev:deploy",
            "dev:monitor",
            "dev:audit",
            
            // Emergency Access
            "emergency:access",
            "emergency:override",
            "emergency:recovery",
            "emergency:audit",
            
            // Wildcard Permissions
            "*"
        ],
        metadata: {
            canDelegate: true,
            isSensitive: true,
            requiresSecurityClearance: true,
            requiresBackgroundCheck: true,
            requiresMultiFactorAuth: true,
            requiresIPWhitelist: true,
            requiresActivityLogging: true,
            requiresApproval: false,
            canOverrideRestrictions: true,
            canBypassLimits: true,
            canForceActions: true,
            canManageEverything: true,
            canAuditEverything: true,
            canAccessEverything: true,
            canModifyEverything: true,
            canDeleteEverything: true,
            canCreateEverything: true,
            canViewEverything: true,
            canExportEverything: true,
            canImportEverything: true,
            canBackupEverything: true,
            canRestoreEverything: true,
            canConfigureEverything: true,
            canMonitorEverything: true,
            canDiagnoseEverything: true,
            canRecoverEverything: true,
            canEmergencyAccess: true,
            canEmergencyOverride: true,
            canEmergencyRecovery: true,
            canEmergencyAudit: true,
            canEmergencyManage: true,
            canEmergencyConfigure: true,
            canEmergencyMonitor: true,
            canEmergencyDiagnose: true,
            canEmergencyRecover: true,
            canEmergencyBackup: true,
            canEmergencyRestore: true,
            canEmergencyExport: true,
            canEmergencyImport: true,
            canEmergencyView: true,
            canEmergencyModify: true,
            canEmergencyDelete: true,
            canEmergencyCreate: true,
            canEmergencyAudit: true,
            canEmergencyManage: true,
            canEmergencyConfigure: true,
            canEmergencyMonitor: true,
            canEmergencyDiagnose: true,
            canEmergencyRecover: true,
            canEmergencyBackup: true,
            canEmergencyRestore: true,
            canEmergencyExport: true,
            canEmergencyImport: true,
            canEmergencyView: true,
            canEmergencyModify: true,
            canEmergencyDelete: true,
            canEmergencyCreate: true
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
            // System Management
            "system:monitor",
            "system:logs",
            "system:audit",
            "system:health",
            "system:settings",
            
            // User Management
            "users:create",
            "users:read",
            "users:update",
            "users:list",
            "users:manage",
            "users:roles",
            "users:permissions",
            "users:status",
            "users:verify",
            "users:block",
            "users:unblock",
            "users:reset_password",
            "users:audit",
            
            // Role Management
            "roles:read",
            "roles:list",
            "roles:assign",
            "roles:revoke",
            "roles:audit",
            
            // Content Management
            "content:create",
            "content:read",
            "content:update",
            "content:delete",
            "content:list",
            "content:approve",
            "content:reject",
            "content:moderate",
            "content:categories",
            "content:tags",
            "content:media",
            "content:audit",
            
            // Security Management
            "security:audit",
            "security:logs",
            "security:alerts",
            "security:incidents",
            "security:policies",
            "security:compliance",
            "security:authentication",
            "security:authorization",
            "security:2fa",
            "security:session_management",
            "security:password_policies",
            
            // Analytics & Reporting
            "analytics:view",
            "analytics:export",
            "analytics:dashboard",
            "analytics:reports",
            "analytics:metrics",
            "analytics:trends",
            "analytics:audit",
            
            // Communication
            "communication:manage",
            "communication:email",
            "communication:sms",
            "communication:push",
            "communication:notifications",
            "communication:templates",
            "communication:campaigns",
            "communication:audit",
            
            // Support & Help
            "support:manage",
            "support:tickets",
            "support:faq",
            "support:knowledge_base",
            "support:chat",
            "support:email",
            "support:phone",
            "support:audit",
            
            // Billing & Payments
            "billing:manage",
            "billing:invoices",
            "billing:payments",
            "billing:subscriptions",
            "billing:refunds",
            "billing:plans",
            "billing:coupons",
            "billing:audit",
            
            // API Management
            "api:manage",
            "api:keys",
            "api:endpoints",
            "api:documentation",
            "api:monitoring",
            "api:rate_limits",
            "api:security",
            "api:audit",
            
            // Database Management
            "database:manage",
            "database:backup",
            "database:restore",
            "database:optimize",
            "database:query",
            "database:audit",
            
            // Server Management
            "server:manage",
            "server:monitor",
            "server:scale",
            "server:deploy",
            "server:config",
            "server:security",
            "server:audit",
            
            // Development Tools
            "dev:tools",
            "dev:debug",
            "dev:test",
            "dev:deploy",
            "dev:monitor",
            "dev:audit"
        ],
        metadata: {
            canDelegate: true,
            isSensitive: true,
            requiresSecurityClearance: true,
            requiresBackgroundCheck: true,
            requiresMultiFactorAuth: true,
            requiresIPWhitelist: true,
            requiresActivityLogging: true,
            requiresApproval: false,
            canOverrideRestrictions: true,
            canBypassLimits: true,
            canForceActions: true,
            canManageEverything: true,
            canAuditEverything: true,
            canAccessEverything: true,
            canModifyEverything: true,
            canDeleteEverything: true,
            canCreateEverything: true,
            canViewEverything: true,
            canExportEverything: true,
            canImportEverything: true,
            canBackupEverything: true,
            canRestoreEverything: true,
            canConfigureEverything: true,
            canMonitorEverything: true,
            canDiagnoseEverything: true,
            canRecoverEverything: true
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