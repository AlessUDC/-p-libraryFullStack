import api from './axios';

// Login User
export const loginUser = async (credentials: { code: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

// Register Student
export const registerStudent = async (data: any) => {
    const response = await api.post('/auth/register/student', data);
    return response.data;
};

// Register Teacher
export const registerTeacher = async (data: any) => {
    const response = await api.post('/auth/register/teacher', data);
    return response.data;
};

// Register Librarian (Admin only)
export const registerLibrarian = async (data: any) => {
    const response = await api.post('/auth/register/librarian', data);
    return response.data;
};

// Confirm Account
export const confirmAccount = async (token: string) => {
    const response = await api.post('/auth/confirm', { token });
    return response.data;
};

// Resend Confirmation Token
export const resendConfirmation = async (email: string) => {
    const response = await api.post('/auth/resend-confirmation', { email });
    return response.data;
};

// Forgot Password
export const forgotPassword = async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

// Verify Reset Password Token
export const verifyResetToken = async (token: string) => {
    const response = await api.post('/auth/verify-reset-token', { token });
    return response.data;
};

// Reset Password
export const resetPassword = async (data: { token: string; newPassword: string }) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
};

// Get Faculties
export const getFaculties = async () => {
    const response = await api.get('/faculties');
    return response.data;
};

// Get Schools by Faculty
export const getSchoolsByFaculty = async (facultyId: string) => {
    const response = await api.get(`/schools?facultyId=${facultyId}`);
    return response.data;
};

// Get Provinces
export const getProvinces = async () => {
    const response = await api.get('/locations/provinces');
    return response.data;
};

// Get Districts by Province
export const getDistrictsByProvince = async (provinceId: string) => {
    const response = await api.get(`/locations/districts?provinceId=${provinceId}`);
    return response.data;
};
