import { createContext, useCallback, useContext, useState } from "react";
import { createRcfRequest, getRcfsRequest, deleteRcfRequest, getRcfRequest, updateRcfsRequest } from "../api/rcfs"
import { getApiErrors } from '../api/errors';

const RcfContext = createContext();

export const useRcfs = () => {
    const context = useContext(RcfContext);

    if (!context) {
        throw new Error("useRcfs must be used within a NoticeProvider");
    }
    return context;
}

export function RcfProvider({ children }) {
    const [rcfs, setRcfs] = useState([]);
    const [errors, setErrors] = useState([]);

    const getRcfs = useCallback(async () => {
        try {
            const res = await getRcfsRequest();
            setRcfs(res.data);
        } catch (error) {
            setErrors(getApiErrors(error, 'No se pudieron cargar las resoluciones'));
        }
    }, []);

    const createRcf = useCallback(async (rcf) => {
        try {
            const res = await createRcfRequest(rcf);
            return res
        } catch (error) {
            setErrors(getApiErrors(error, 'No se pudo crear la resolución'));
        }
    }, []);

    const deleteRcf = useCallback(async (id) => {
        try {
            const res = await deleteRcfRequest(id);
            if (res.status === 204) setRcfs((current) => current.filter((rcf) => rcf._id !== id));
            return res;
        } catch (error) {
            setErrors(getApiErrors(error, 'No se pudo eliminar la resolución'));
        }
    }, []);

    const getRcf = useCallback(async (id) => {
        try {
            const res = await getRcfRequest(id);
            return res.data
        } catch (error) {
            setErrors(getApiErrors(error, 'No se pudo cargar la resolución'));
        }
    }, []);

    const updateRcf = useCallback(async (id, rcf) => {
        try {
            const res = await updateRcfsRequest(id, rcf);
            return res;
        } catch (error) {
            setErrors(getApiErrors(error, 'No se pudo actualizar la resolución'));
        }
    }, []);

    return (
        <RcfContext.Provider value={{ rcfs, errors, setErrors, createRcf, getRcfs, deleteRcf, getRcf, updateRcf }}>
            {children}
        </RcfContext.Provider>
    )
}
