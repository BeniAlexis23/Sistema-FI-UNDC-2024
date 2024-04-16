import { useEffect } from "react";
import { useRcfs } from "../context/RcfsContext";
import RcfCard from "../components/RcfCard";

import NavbarAdmin from "../components/NavbarAdmin";

function RcfsPage() {

  const { getRcfs, rcfs } = useRcfs()

  useEffect(() => {
    getRcfs();
  }, []);



  return (
    <>
      <NavbarAdmin />
      {rcfs.length === 0 && <h1>No hay RCF</h1>}
      <div className="flex justify-center px-5 mt-2">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
          {
            rcfs.map((rcf) => (
              <RcfCard rcf={rcf} key={rcf._id} />
            ))
          }
        </div>
      </div>
    </>
  )
}

export default RcfsPage;