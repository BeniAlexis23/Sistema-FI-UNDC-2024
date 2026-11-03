import axios from './axios';

export const getCategoriesRequest = () => axios.get('/categories');
export const createCategoryRequest = (name) => axios.post('/categories', { name });
export const updateCategoryRequest = (id, changes) => axios.patch(`/categories/${id}`, changes);
export const deleteCategoryRequest = (id) => axios.delete(`/categories/${id}`);
