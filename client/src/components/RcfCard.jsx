import { useRcfs } from "../context/RcfsContext";
import { Link } from "react-router-dom";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc)

const RcfCard = ({ rcf }) => {

    const { deleteRcf } = useRcfs();

    return (
        <div className="relative flex w-full max-w-[48rem] flex-row rounded-xl bg-zinc-800 bg-clip-border text-white shadow-md">
            <div className="p-6">
                <h4 className="mb-2 block font-sans text-2xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
                    {rcf.title}
                </h4>
                <p className="mb-8 block font-sans text-base font-normal leading-relaxed text-white antialiased">
                    {rcf.description}
                </p>
                <Link to={rcf.url} target="_blank" className="mb-8 block font-sans text-base font-normal leading-relaxed text-white antialiased">
                    Link
                </Link>
                <p className="text-white">{dayjs(rcf.date).utc().format("DD/MM/YYYY")}</p>
                <div className="flex gap-x-2 items-center">
                    <Link to={`/rcfs/${rcf._id}`} className="bg-yellow-500 px-4 py-1 rounded-sm" >Editar</Link>
                    <button className="bg-red-500 text-white px-4 py-1 rounded-sm" onClick={() => { deleteRcf(rcf._id) }}>Eliminar</button>
                </div>
            </div>
        </div>
    )
}

export default RcfCard