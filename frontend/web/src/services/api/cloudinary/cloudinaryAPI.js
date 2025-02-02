import axios from 'axios';
import api from '../../config/config';

const CLOUDINARY_API = {
    // Upload a single image
    uploadImage: async (file, folder = '') => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (folder) {
                formData.append('folder', folder);
            }

            const response = await api.post(`/api/upload/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { 
                success: false, 
                message: 'Failed to upload image', 
                data: null 
            };
        }
    },

    // Upload multiple images
    uploadImages: async (files, folder = '') => {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });
            if (folder) {
                formData.append('folder', folder);
            }

            const response = await api.post(`/api/upload/images`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                success: false,
                message: 'Failed to upload images',
                data: null
            };
        }
    },

    // Delete an image by public ID
    deleteImage: async (publicId) => {
        try {
            const response = await api.delete(`/api/upload/image`, {
                params: { publicId }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || {
                success: false,
                message: 'Failed to delete image',
                data: null
            };
        }
    }
};

export default CLOUDINARY_API;
