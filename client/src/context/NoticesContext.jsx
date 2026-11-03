import { createContext, useCallback, useContext, useRef, useState } from "react";
import {
    deleteNoticeRequest, getNoticeRequest, getNoticeStatsRequest, getNoticesPageRequest, updateNoticeVisibilityRequest
} from "../api/notices";
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
    const [pageInfo, setPageInfo] = useState({ total: 0, page: 1, limit: 12 });
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);
    const latestRequest = useRef(0);

    // si llegan varias búsquedas seguidas solo cuenta la última
    const getNotices = useCallback(async (params) => {
        const requestId = ++latestRequest.current;
        setLoading(true);
        try {
            const res = await getNoticesPageRequest(params);
            if (requestId !== latestRequest.current) return;
            setNotices(res.data.items);
            setPageInfo({ total: res.data.total, page: res.data.page, limit: res.data.limit });
            setErrors([]);
        } catch (error) {
            if (requestId !== latestRequest.current) return;
            setErrors(getApiErrors(error, 'No se pudieron cargar las noticias'));
        } finally {
            if (requestId === latestRequest.current) setLoading(false);
        }
    }, []);

    const getStats = useCallback(async () => {
        try {
            const res = await getNoticeStatsRequest();
            setStats(res.data);
        } catch (error) {
            // las cifras de las pestañas son informativas: la lista funciona sin ellas
        }
    }, []);

    const getNotice = useCallback(async (id) => (await getNoticeRequest(id)).data, []);

    // los errores se propagan para que quien llama pueda avisar al usuario
    const deleteNotice = useCallback(async (id) => {
        const res = await deleteNoticeRequest(id);
        setNotices((current) => current.filter((notice) => notice._id !== id));
        setPageInfo((current) => ({ ...current, total: Math.max(0, current.total - 1) }));
        return res;
    }, []);

    const updateVisibility = useCallback(async (id, changes) => {
        const res = await updateNoticeVisibilityRequest(id, changes);
        setNotices((current) => current.map((notice) => (notice._id === id ? { ...notice, ...res.data } : notice)));
        return res.data;
    }, []);

    return (
        <NoticeContext.Provider value={{ notices, pageInfo, stats, loading, errors, getNotices, getStats, getNotice, deleteNotice, updateVisibility }}>
            {children}
        </NoticeContext.Provider>
    )
}
