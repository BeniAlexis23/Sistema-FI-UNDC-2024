import { useEffect } from "react";
import { useNotices } from "../context/NoticesContext";
import NoticeCard from "../components/NoticeCard";

import NavbarAdmin from "../components/NavbarAdmin";

function NoticesPage() {

  const { getNotices, notices } = useNotices()

  useEffect(() => {
    getNotices();
  }, []);

  return (
    <>
      <NavbarAdmin />
      {notices.length === 0 && <h1>No hay Noticias</h1>}
      <div className="flex justify-center px-5">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
          {
            notices.map((notice) => (
              <NoticeCard notice={notice} key={notice._id} />
            ))
          }
        </div>
      </div>
    </>
  )
}

export default NoticesPage;