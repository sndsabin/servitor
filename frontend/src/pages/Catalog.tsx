import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { toast, Slide } from "react-toastify";

import { api } from "../api";
import ServiceCard from "../components/ServiceCard";
import Pagination from "../components/Pagination";
import { Service, StartServiceRequest } from "../types";

const PAGE_SIZE = 9;
const ALL_CATEOGRY = "All";

type OutletContext = {
  query: string;
  setError: (message: string) => void;
};

const Catalog = () => {
  const { query, setError } = useOutletContext<OutletContext>();

  const [category, setCategory] = useState(ALL_CATEOGRY);
  const [page, setPage] = useState(1);
  const [serviceCatalog, setServiceCatalog] = useState<Service[]>([]);

  const categories = useMemo(() => {
    const categorySet = new Set(serviceCatalog.map((service) => service.category));
    return ["All", ...Array.from(categorySet).sort()];
  }, [serviceCatalog]);

  const filtered = useMemo(() => {
    return serviceCatalog.filter((service) => {
      const matchesCategory = category == ALL_CATEOGRY || service.category == category;
      const matchesQuery =
        query.trim() === "" || service.name.toLowerCase().includes(query.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [serviceCatalog, query, category]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleLaunch = async (req: StartServiceRequest) => {
    try {
      await api.launchContainer(req);

      const message = `${req.name} launched`;
      toast.info(message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
        icon: <CheckCircle2 size={16} className="text-emerald-500" />,
        progressClassName: "bg-emrald-400",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    api
      .getServiceCatalog()
      .then((catalog) => {
        setServiceCatalog(catalog);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
      });
  }, []);

  return (
    <>
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Catalog</h1>
        <p className="mt-1 text-[14px] text-slate-500">
          Pick a version, launch a container, get to work.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => {
              setCategory(cat);
              setPage(1);
            }}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
              category === cat
                ? "bg-accent-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {paged.length ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((service) => (
            <ServiceCard key={service.name} service={service} onLaunch={handleLaunch} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
          <p className="text-[13px] text-slate-500">No services found.</p>
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
    </>
  );
};

export default Catalog;
