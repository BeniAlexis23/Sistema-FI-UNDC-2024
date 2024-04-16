import { createContext, useContext, useState } from "react";
import { createRcfRequest, getRcfsRequest, deleteRcfRequest, getRcfRequest, updateRcfsRequest } from "../api/rcfs"

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

    const getRcfs = async () => {
        try {
            const res = await getRcfsRequest();
            setRcfs(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    const createRcf = async (rcf) => {
        try {
            const res = await createRcfRequest(rcf);
            return res
        } catch (error) {
            console.log(error.response.data)
            if (Array.isArray(error.response.data)) {
                return setErrors(error.response.data);
            }
            setErrors([error.response.data.message]);
        }
    }

    const deleteRcf = async (id) => {
        try {
            const res = await deleteRcfRequest(id);
            if (res.status === 204) setRcfs(rcfs.filter((rcf) => rcf._id !== id));
        } catch (error) {
            console.log(error)
        }
    }

    const getRcf = async (id) => {
        try {
            const res = await getRcfRequest(id);
            return res.data
        } catch (error) {
            console.error(error)
        }
    }

    const updateRcf = async (id, rcf) => {
        try {
            await updateRcfsRequest(id, rcf);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <RcfContext.Provider value={{ rcfs, errors, setErrors, createRcf, getRcfs, deleteRcf, getRcf, updateRcf }}>
            {children}
        </RcfContext.Provider>
    )
} 