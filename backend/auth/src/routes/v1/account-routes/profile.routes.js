import { Router } from 'express';
import {
    validateProfileUpdateMiddleware,
    validateAvatarUpdate,
    validatePersonalInformation,
    validateEducation
} from '../../../validators/account/profile/profile.validator.js';
import {
    getProfile,
    updateProfile,
    updateAvatar,
    deleteAvatar,
    updatecover,
    deletecover
} from '../../../controllers/account/profile/profile.controller.js';
import {
    getAllPersonalInfo,
    updatePersonalInfo,
    addEducation,
    updateEducation,
    deleteEducation,
    getAllEducation,
    getEducationById,
    updateMedicalInfo,
    addMedicalReport,
    updateMedicalReport,
    deleteMedicalReport
} from '../../../controllers/account/profile/personal/personal.controller.js';
import {
    getContactInfo,
    createContactNumber,
    updateContactNumber,
    deleteContactNumber,
    createAddress,
    updateAddress,
    deleteAddress,
    createWebsite,
    updateWebsite,
    deleteWebsite
} from '../../../controllers/account/profile/contact/contact.controller.js';
import { validateContactNumber, validateAddress, validateWebsite } from '../../../validators/account/profile/contact.validator.js';
import { upload } from '../../../config/cloudinary.js';

const router = Router();

// Basic Profile Routes
router.get('/', getProfile);
router.patch('/update',
    validateProfileUpdateMiddleware,
    updateProfile
);

// Media Routes
router.post(
    '/avatar',
    upload.single('avatar'),
    validateAvatarUpdate,
    updateAvatar
);
router.delete('/avatar',
    deleteAvatar
);

router.post(
    '/cover',
    upload.single('cover'),
    validateAvatarUpdate,
    updatecover
);
router.delete('/cover',
    deletecover
);

// Personal Information Routes
router.get('/personal',
    getAllPersonalInfo
);
router.put(
    '/personal/basic',
    validatePersonalInformation,
    updatePersonalInfo
);



// Education Routes
router.get('/personal/education',
    getAllEducation
);
router.get('/personal/education/:id',
    getEducationById
);
router.post(
    '/personal/education',
    validateEducation,
    addEducation
);
router.put(
    '/personal/education/:id',
    validateEducation,
    updateEducation
);
router.delete('/personal/education/:id',
    deleteEducation
);



// Contact Information Routes
router.get('/contact',
    getContactInfo
);
router.post('/contact/numbers',
    validateContactNumber,
    createContactNumber
);
router.put('/contact/numbers/:id',
    validateContactNumber,
    updateContactNumber
);
router.delete('/contact/numbers/:id',
    deleteContactNumber
);


router.post('/contact/addresses',
    validateAddress,
    createAddress
);
router.put('/contact/addresses/:id',
    validateAddress,
    updateAddress
);
router.delete('/contact/addresses/:id',
    deleteAddress
);

router.post('/contact/websites',
    validateWebsite,
    createWebsite
);
router.put('/contact/websites/:id',
    validateWebsite,
    updateWebsite
);
router.delete('/contact/websites/:id',
    deleteWebsite
);








// Medical Routes
router.post('/personal/medical',
    updateMedicalInfo
);
router.put('/personal/medical',
    updateMedicalInfo
);
router.post('/personal/medical/reports',
    addMedicalReport
);
router.put('/personal/medical/reports/:id',
    updateMedicalReport
);
router.delete('/personal/medical/reports/:id',
    deleteMedicalReport
);

export { router as profileRoutes };
