import { useState } from "react";
import { useLocation } from "react-router-dom";

import Search from "./Search";

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
}

const Header = ({ query, onQueryChange }: Props) => {
  const location = useLocation();
  const showSearch = location.pathname === "/catalog";

  return (
    <header className="flex h-14 shrink-0 items-center justify-end border-b border-slate-100 bg-white px-6">
      {showSearch && (
        <Search placeholder="Search Services" query={query} onQueryChange={onQueryChange} />
      )}
    </header>
  );
};

export default Header;
