import { BrowserRouter, Route, Routes } from "react-router";
import Users from './views/Location';
import Delivery from "./views/Delivery";
import Distance from "./views/Distance";
import Maps from "./views/Maps";

function App() {
  return (

    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Users />} />
        <Route path='/delivery' element={<Delivery />} />
        <Route path='/distance' element={<Distance />} />
        <Route path='/maps' element={<Maps />} />
      </Routes>
    </BrowserRouter>

  );
}

export default App;