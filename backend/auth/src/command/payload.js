import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { ROLE_DEFINITIONS } from '../constants/roles.constants.js';

const prisma = new PrismaClient();

const SUPER_ADMIN_DATA = {
    "role": "SUPER_ADMIN",
    "firstName": "MD Shoaib",
    "lastName": "Khan",
    "email": "abrohoman019@gmail.com",
    "phoneNumber": "+8801909978166",
    "dateOfBirth": {
        "day": 1,
        "month": 12,
        "year": 2001
    },
    "password": "SuperAdmin123!",
    "confirmPassword": "SuperAdmin123!",
    "gender": "MALE",
    "termsAccepted": true,
    "description": "I am excited to join this platform."
};

const ALPHA_ROLE = async (userId) => {
    try {
        // Get the ALPHA role definition from constants
        const alphaRole = ROLE_DEFINITIONS.ALPHA;

        // Create UserRoleAssignment for SUPER_ADMIN
        await prisma.userRoleAssignment.create({
            data: {
                userId,
                roleId: alphaRole.id,
                assignedBy: "SYSTEM"
            }
        });

        // Create PersonalInformation
        await prisma.personalInformation.create({
            data: {
                userId,
                firstName: SUPER_ADMIN_DATA.firstName,
                lastName: SUPER_ADMIN_DATA.lastName,
                genderIdentity: SUPER_ADMIN_DATA.gender,
                dateOfBirth: new Date(
                    SUPER_ADMIN_DATA.dateOfBirth.year,
                    SUPER_ADMIN_DATA.dateOfBirth.month - 1,
                    SUPER_ADMIN_DATA.dateOfBirth.day
                ),
                description: SUPER_ADMIN_DATA.description
            }
        });

        // Create AccountPreferences
        await prisma.accountPreferences.create({
            data: {
                userId,
                preferences: {
                    notifications: {
                        email: true,
                        sms: true,
                        push: true,
                        system: true
                    },
                    settings: {
                        language: "en",
                        timezone: "UTC",
                        theme: "dark",
                        layout: "default"
                    }
                },
                theme: "DARK",
                language: "EN",
                currency: "BDT",
                isEmailEnabled: true,
                isSmsEnabled: true,
                isDarkModeEnabled: true
            }
        });

        // Create NotificationPreferences
        await prisma.notificationPreferences.create({
            data: {
                userId,
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: true
            }
        });

        // Create ActivityLogSettings
        await prisma.activityLogSettings.create({
            data: {
                userId,
                logFailedLogin: true,
                logAccountChanges: true,
                logProfileUpdates: true
            }
        });

        // Create SecurityQuestion
        await prisma.securityQuestion.create({
            data: {
                userId,
                question: "What is your mother's maiden name?",
                answer: "SYSTEM_ADMIN" // This should be hashed in production
            }
        });

        // Create UserConsent
        await prisma.userConsent.create({
            data: {
                userId,
                consented: true
            }
        });

        // Create AuditLog for account creation
        await prisma.auditLog.create({
            data: {
                userId,
                action: "ACCOUNT_CREATION",
                details: {
                    type: "SUPER_ADMIN",
                    createdBy: "SYSTEM",
                    timestamp: new Date().toISOString()
                }
            }
        });

        console.log('Super admin role and profile data created successfully');
    } catch (error) {
        console.error('Error creating super admin role and profile:', error);
        throw error;
    }
};

const createRoles = async () => {
    try {
        console.log('Creating roles in database...');
        
        // Create roles from ROLE_DEFINITIONS
        for (const [key, roleDef] of Object.entries(ROLE_DEFINITIONS)) {
            const { id, name, description } = roleDef;
            
            // Check if role already exists
            const existingRole = await prisma.userRole.findUnique({
                where: { id }
            });

            if (!existingRole) {
                // Create new role with only the fields that exist in the schema
                await prisma.userRole.create({
                    data: {
                        id,
                        name,
                        description: description || null
                    }
                });
                console.log(`Created role: ${name}`);
            } else {
                console.log(`Role already exists: ${name}`);
            }
        }
        
        console.log('All roles have been created successfully');
    } catch (error) {
        console.error('Error creating roles:', error);
        throw error;
    }
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const checkServerAvailability = async (retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await axios.get('http://localhost:8080/api/v1/health');
            return true;
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`Server not ready, retrying in ${delay/1000} seconds... (${i + 1}/${retries})`);
            await wait(delay);
        }
    }
};

const checkEmailExists = async () => {
    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: SUPER_ADMIN_DATA.email
            }
        });
        return existingUser !== null;
    } catch (error) {
        console.error('Error checking email in database:', error.message);
        return false;
    }
};

const createSuperAdmin = async () => {
    try {
        // First create all roles
        await createRoles();

        // Then check if email exists in database
        const emailExists = await checkEmailExists();
        if (emailExists) {
            console.log('\x1b[33m%s\x1b[0m', 'Super admin account already exists with email:', SUPER_ADMIN_DATA.email);
            return { email: SUPER_ADMIN_DATA.email, exists: true };
        }

        // Wait for server to be available
        console.log('Checking server availability...');
        await checkServerAvailability();
        console.log('Server is available, proceeding with super admin creation...');

        // Create super admin account using the registration API
        const response = await axios.post('http://localhost:8080/api/v1/auth/register', SUPER_ADMIN_DATA);

        if (response.data.success) {
            console.log('\x1b[32m%s\x1b[0m', 'Super admin account created successfully:', response.data.data.email);
            
            // After successful registration, create the ALPHA role and profile data
            await ALPHA_ROLE(response.data.data.id);
            
            return response.data.data;
        } else {
            console.error('Failed to create super admin account:', response.data.message);
            throw new Error(response.data.message);
        }
    } catch (error) {
        if (error.response) {
            // Check if the error is due to email already being registered
            if (error.response.status === 409 || 
                (error.response.data && 
                 (error.response.data.message === 'Email already registered' || 
                  error.response.data.error === 'Email already registered'))) {
                return { email: SUPER_ADMIN_DATA.email, exists: true };
            }
            
            // For other errors
            const errorMessage = error.response.data?.message || error.response.data?.error || 'Unknown error';
            console.error('\x1b[31m%s\x1b[0m', `Error creating super admin: ${errorMessage}`);
            throw new Error(errorMessage);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('\x1b[31m%s\x1b[0m', 'No response received from server. Please ensure the server is running on port 8080.');
            throw new Error('Server is not responding. Please start the server and try again.');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('\x1b[31m%s\x1b[0m', `Error setting up request: ${error.message}`);
            throw error;
        }
    } finally {
        // Always disconnect from Prisma
        await prisma.$disconnect();
    }
};

// Export the function
export { createSuperAdmin };

// If this file is run directly, execute the function
if (process.argv[1] === import.meta.url) {
    createSuperAdmin()
        .then((result) => {
            if (result.exists) {
                console.log('\x1b[33m%s\x1b[0m', 'Super admin account already exists with email:', SUPER_ADMIN_DATA.email);
                process.exit(0);
            } else {
                console.log('\x1b[32m%s\x1b[0m', 'Super admin account created successfully');
                process.exit(0);
            }
        })
        .catch((error) => {
            // Only show the error message, not the stack trace
            if (error.message === 'Email already registered') {
                console.log('\x1b[33m%s\x1b[0m', 'Super admin account already exists with email:', SUPER_ADMIN_DATA.email);
                process.exit(0);
            } else {
                console.error('\x1b[31m%s\x1b[0m', `Failed to create super admin: ${error.message}`);
                process.exit(1);
            }
        });
} 