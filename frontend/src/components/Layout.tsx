import React from "react";
import Header from "./Header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Header />
      <div className="w-full h-16"></div>
      {children}
    </div>
  );
};

export default Layout;
