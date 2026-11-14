import "@fontsource/sofia-sans-extra-condensed/cyrillic-700.css";
import "@fontsource/sofia-sans-extra-condensed/latin-700.css";
import "@fontsource/sofia-sans-extra-condensed/latin-ext-700.css";
import "@fontsource/sofia-sans-extra-condensed/cyrillic-900.css";
import "@fontsource/sofia-sans-extra-condensed/latin-900.css";
import "@fontsource/sofia-sans-extra-condensed/latin-ext-900.css";
import "@fontsource/geologica/cyrillic-400.css";
import "@fontsource/geologica/latin-400.css";
import "@fontsource/geologica/latin-ext-400.css";
import "@fontsource/geologica/cyrillic-500.css";
import "@fontsource/geologica/latin-500.css";
import "@fontsource/geologica/latin-ext-500.css";
import "@fontsource/geologica/cyrillic-600.css";
import "@fontsource/geologica/latin-600.css";
import "@fontsource/geologica/latin-ext-600.css";
import "@fontsource/martian-mono/cyrillic-400.css";
import "@fontsource/martian-mono/latin-400.css";
import "@fontsource/martian-mono/latin-ext-400.css";
import "@fontsource/martian-mono/cyrillic-700.css";
import "@fontsource/martian-mono/latin-700.css";
import "@fontsource/martian-mono/latin-ext-700.css";
// latin-ext нужен ради знака рубля (U+20BD)
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import AccountPage from "./pages/Account";
import BookingPage from "./pages/Booking";
import RatingPage from "./pages/Rating";
import { CourtsBoard } from "./sections/CourtsBoard";
import { Hero, Marquee } from "./sections/Hero";
import { Contacts, FirstTime, HowTo, Prices, RatingTeaser, Shop, Training, Venues } from "./sections/HomeSections";
import { AppProvider } from "./state/AppContext";

function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <CourtsBoard />
      <Venues />
      <Prices />
      <Training />
      <FirstTime />
      <RatingTeaser />
      <Shop />
      <HowTo />
      <Contacts />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/rating" element={<RatingPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  </React.StrictMode>,
);
