import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const BasicLayout = () => {
  return (
    <>
      <Header />
      <div className="flex-grow mt-16" >
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default BasicLayout;