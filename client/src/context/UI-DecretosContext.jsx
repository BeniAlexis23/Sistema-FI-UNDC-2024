import { createContext, useContext, useState } from "react";
import { createDecretoRequest, getDecretosRequest, deleteDecretoRequest, getDecretoRequest, updateDecretoRequest } from "../api/ui-decretos"

const DecretoContext = createContext();

export const useDecretos = () => {
    const context = useContext(DecretoContext);

    if (!context) {
        throw new Error("useDecretos must be used within a DecretoProvider");
    }
    return context;
}

export function DecretoProvider({ children }) {
    const [decretos, setDecretos] = useState([]);
    const [errors, setErrors] = useState([]);

    const getDecretos = async () => {
        try {
            const res = await getDecretosRequest();
            setDecretos(res.data);
        } catch (error) {
            console.log(error);
        }
    }

    const createDecreto = async (decreto) => {
        try {
            const res = await createDecretoRequest(decreto);
            return res
        } catch (error) {
            console.log(error.response.data)
            if (Array.isArray(error.response.data)) {
                return setErrors(error.response.data);
            }
            setErrors([error.response.data.message]);
        }
    }

    const deleteDecreto = async (id) => {
        try {
            const res = await deleteDecretoRequest(id);
            if (res.status === 204) setDecretos(decretos.filter((decreto) => decreto._id !== id));
            return res;
        } catch (error) {
            console.log(error);
        }
    }

    const getDecreto = async (id) => {
        try {
            const res = await getDecretoRequest(id);
            return res.data
        } catch (error) {
            console.error(error)
        }
    }

    const updateDecreto = async (id, decreto) => {
        try {
            const res = await updateDecretoRequest(id, decreto);
            return res;
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <DecretoContext.Provider value={{ decretos, errors, setErrors, createDecreto, getDecretos, deleteDecreto, getDecreto, updateDecreto }}>
            {children}
        </DecretoContext.Provider>
    )
}