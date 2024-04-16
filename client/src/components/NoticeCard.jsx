import { useNotices } from "../context/NoticesContext";
import { Link } from "react-router-dom";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc)

const NoticeCard = ({ notice }) => {

    const { deleteNotice } = useNotices();

    return (
        <div className="relative flex w-full max-w-[48rem] flex-row rounded-xl bg-zinc-800 bg-clip-border text-white shadow-md">
            <div className="relative m-0 w-2/5 shrink-0 overflow-hidden rounded-xl rounded-r-none bg-zinc-800 bg-clip-border">
                <img
                    src={notice.imageUrl} 
                    alt="image"
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="p-6">
                <h4 className="mb-2 block font-sans text-2xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
                    {notice.title}
                </h4>
                <p className="mb-8 block font-sans text-base font-normal leading-relaxed text-white antialiased">
                    {notice.description}
                </p>
                <p className="text-white">{dayjs(notice.date).utc().format("DD/MM/YYYY")}</p>
                <div className="flex gap-x-2 items-center">
                    <Link to={`/notices/${notice._id}`} className="bg-yellow-500 px-4 py-1 rounded-sm" >Editar</Link>
                    <button className="bg-red-500 text-white px-4 py-1 rounded-sm" onClick={() => { deleteNotice(notice._id) }}>Eliminar</button>
                </div>
            </div>
        </div>
    )
}

export default NoticeCard
