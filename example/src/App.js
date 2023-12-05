import logo from './logo.svg';
import './App.css';
import Pixos from 'calliope-pixos';
const PixosClient = Pixos['calliope-pixos'].default;
function App() {
  return (
    <div className="App" width="650px">
      <PixosClient />
    </div>
  );
}

export default App;
