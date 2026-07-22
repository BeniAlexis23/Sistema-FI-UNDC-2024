import { createContext, useCallback, useContext, useState } from "react";
import { createNoticeRequest, getNoticesRequest, deleteNoticeRequest, getNoticeRequest, updateNoticesRequest } from "../api/notices";
import { getApiErrors } from '../api/errors';

const NoticeContext = createContext();

export const useNotices = () => {
    const context = useContext(NoticeContext);
    if (!context) {
        throw new Error("useNotices must be used within a NoticeProvider");
    }
    return context;
}

export const NoticeProvider = ({ children }) => {
    const [notices, setNotices] = useState([]);
    const [errors, setErrors] = useState([]);

    const getNotices = useCallback(async () => {
        try {
            const res = await getNoticesRequest();
            setNotices(res.data);
        } catch (error) {
            setErrors(getApiErrors(error, 'No se pudieron cargar las noticias'));
        }
    }, []);

    const createNotice = useCallback(async (notice) => {
        try {
            const res = await createNoticeRequest(notice);
            return res;
        } catch (error) {
            setErrors(getApiErrors(error, 'No se pudo crear la noticia'));
        }
    }, []);

    const deleteNotice = useCallback(async (id) => {
        try {
            const res = await deleteNoticeRequest(id);
            if (res.status === 204) setNotices((current) => current.filter((notice) => notice._id !== id));
            return res;
        } catch (error) {
            setErrors(getApiErrors(error, 'No se pudo eliminar la noticia'));
        }
    }, []);

    const getNotice = useCallback(async (id) => {
        try {
            const res = await getNoticeRequest(id);
            return res.data;
        } catch (error) {
            setErrors(getApiErrors(error, 'No se pudo cargar la noticia'));
        }
    }, []);

    const updateNotice = useCallback(async (id, notice) => {
        try {
            const res = await updateNoticesRequest(id, notice);
            return res;
        } catch (error) {
            setErrors(getApiErrors(error, 'No se pudo actualizar la noticia'));
        }
    }, []);

    return (
        <NoticeContext.Provider value={{ notices, errors, setErrors, createNotice, getNotices, deleteNotice, getNotice, updateNotice }}>
            {children}
        </NoticeContext.Provider>
    )
}
