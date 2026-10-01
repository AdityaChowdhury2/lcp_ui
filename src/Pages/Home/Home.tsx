import React from "react";
import "./HomeStyle.css";
import Banner from "../../Components/HomeComponents/Banner/Banner";
import Announcement from "../../Components/HomeComponents/Announcement/Announcement";
import Directorate from "../../Components/HomeComponents/Directorate/Directorate";
import News from "../../Components/HomeComponents/News/News"
import Guidelines from "../../Components/HomeComponents/Guidelines/Guidelines";
import UserManualOtherCards from "../../Components/HomeComponents/UserManualOtherCards/UserManualOtherCards"
// import Header from "../../ShareModules/Header/Header copy";

const Home = () => {
  return (
    <>
      <Banner />
      <Announcement />
      {/* <Directorate /> */}
      <Guidelines />
      {/* <News /> */}
      <UserManualOtherCards />
    </>
  );
};

export default Home;
