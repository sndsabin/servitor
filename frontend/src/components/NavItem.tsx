import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface Props {
  to: string;
  icon: LucideIcon;
  label: string;
}

const NavItem = ({ to, icon: Icon, label }: Props) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${isActive ? "bg-accent-500 text-white" : "hover:bg-sidebar-hover text-slate-300 hover:text-white"}`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isActive ? "bg-white/20" : ""}`}
          >
            <Icon size={13} strokeWidth={2.25} />
          </span>
          {label}
        </>
      )}
    </NavLink>
  );
};

export default NavItem;
