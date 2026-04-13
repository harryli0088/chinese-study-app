import { HashRouter, Routes, Route } from "react-router-dom";

import { ItemPage } from "./components/ItemPage/ItemPage";
import { HomePage } from "./components/HomePage/HomePage";

import './App.scss'

export function App() {
  return (
    <div id="app">
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/item/:id" element={<ItemPage />} />
        </Routes>
      </HashRouter>
    </div>
  )
}
