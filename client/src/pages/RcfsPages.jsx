import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import { useRcfs } from '../context/RcfsContext';
import AdminLayout from '../components/AdminLayout';
import AdminDocumentList from '../components/AdminDocumentList';

const RcfsPage = () => {
  const { getRcfs, deleteRcf, rcfs } = useRcfs();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  useEffect(() => { getRcfs(); }, [getRcfs]);
  const years = useMemo(() => [...new Set(rcfs.map((item) => new Date(item.date).getFullYear().toString()))].sort().reverse(), [rcfs]);
  const filteredItems = useMemo(() => rcfs.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(searchTerm.toLowerCase()) && (!selectedYear || new Date(item.date).getFullYear().toString() === selectedYear)), [rcfs, searchTerm, selectedYear]);
  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: '¿Eliminar resolución?', text: 'Esta acción no se puede revertir.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', confirmButtonColor: '#dc2626', cancelButtonText: 'Cancelar', cancelButtonColor: '#475569', reverseButtons: true, focusCancel: true });
    if (result.isConfirmed) { await deleteRcf(id); Swal.fire({ title: 'Resolución eliminada', icon: 'success', confirmButtonColor: '#1081ea' }); }
  };
  return <AdminLayout title="Resoluciones" description="Administra las resoluciones del Consejo de Facultad y sus enlaces de descarga." action={<Link to="/add-rcf" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,129,234,0.22)] transition hover:bg-secondary"><Plus size={18} /> Nueva resolución</Link>}><AdminDocumentList items={filteredItems} resourcePath="rcfs" searchTerm={searchTerm} onSearch={(event) => setSearchTerm(event.target.value)} selectedYear={selectedYear} onYearChange={(event) => setSelectedYear(event.target.value)} years={years} onDelete={handleDelete} emptyLabel="No se encontraron resoluciones" /></AdminLayout>;
};

export default RcfsPage;
