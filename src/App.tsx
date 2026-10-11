import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { POS } from "./pages/POS";
function Content() { return useAuth().user ? <POS /> : <Login />; }
export default function App() { return <AuthProvider><Content /></AuthProvider>; }
