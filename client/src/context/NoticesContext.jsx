import { createContext, useContext, useState } from "react";
import { createNoticeRequest, getNoticesRequest, deleteNoticeRequest, getNoticeRequest, updateNoticesRequest } from "../api/notices";

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

    const getNotices = async () => {
        try {
            const res = await getNoticesRequest();
            setNotices(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    const createNotice = async (notice) => {
        try {
            const res = await createNoticeRequest(notice);
            return res;
        } catch (error) {
            console.log(error.response.data);
            if (Array.isArray(error.response.data)) {
                setErrors(error.response.data);
            } else {
                setErrors([error.response.data.message]);
            }
        }
    }

    const deleteNotice = async (id) => {
        try {
            const res = await deleteNoticeRequest(id);
            if (res.status === 204) setNotices(notices.filter((notice) => notice._id !== id));
            return res;
        } catch (error) {
            console.log(error);
        }
    }

    const getNotice = async (id) => {
        try {
            const res = await getNoticeRequest(id);
            return res.data;
        } catch (error) {
            console.error(error);
        }
    }

    const updateNotice = async (id, notice) => {
        try {
            const res = await updateNoticesRequest(id, notice);
            return res;
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <NoticeContext.Provider value={{ notices, errors, setErrors, createNotice, getNotices, deleteNotice, getNotice, updateNotice }}>
            {children}
        </NoticeContext.Provider>
    )
}