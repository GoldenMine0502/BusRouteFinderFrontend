import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import './App.css';
import Main from "./Main";
import Admin from "./Admin";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={ <Main /> }/>
                <Route path='/admin' element={ <Admin /> }/>
                {/*<Navigate path="/" to="/0" />*/}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
