import React from "react";
import HomePage from "./(frontend)/home";
import TopNavbar from "@/components/layout/Navbar/TopNavbar";
import TopBanner from "@/components/layout/Banner/TopBanner";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <TopBanner />
      <TopNavbar />
      <HomePage />
      <Footer />
    </>
  );
}
