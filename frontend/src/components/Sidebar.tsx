import { LayoutDashboard, Grid3x3, Info, Loader2 } from "lucide-react";

import NavItem from "./NavItem";
import Logo from "./Logo";
import { DockerStatus } from "../types";

interface Props {
  dockerStatus: DockerStatus | null;
}

const Sidebar = ({ dockerStatus }: Props) => {
  return (
    <aside className="bg-sidebar flex w-60 shrink-0 flex-col">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <Logo className="h-7" />
        <span className="text-[15px] font-semibold tracking-tight text-white">Servitor</span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/catalog" icon={Grid3x3} label="Catalog" />
        <NavItem to="/about" icon={Info} label="About" />
      </nav>

      <div className="mt-auto px-3 pb-5">
        <div className="border-sidebar-border bg-sidebar-hover flex w-full items-center gap-0.5 rounded-lg border px-3 py-2.5 text-left text-[12px] text-slate-300 transition-colors hover:bg-white/5">
          <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
            {dockerStatus === null ? (
              <Loader2 size={14} className="animate-spin text-slate-500" />
            ) : null}

            <span
              className={`ring-sidebar absolute h-2 w-2 rounded-full ring-2 ${
                dockerStatus === null
                  ? "bg-slate-500"
                  : dockerStatus.available
                    ? "bg-emerald-400"
                    : "bg-rose-400"
              }`}
            ></span>
          </span>

          <span className="min-w-0 flex-1 truncate">
            {dockerStatus === null && "Pinging Docker…"}
            {dockerStatus?.available && `Docker (v${dockerStatus?.version})`}
            {dockerStatus && !dockerStatus.available && "Docker unreachable"}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
