import logo from './logo.svg';
import './App.css';
import Pixos from 'calliope-pixos';
const PixosAvatar = Pixos['calliope-pixos'].default;
function App() {
  return (
    <div className="App" width="650px">
      <PixosAvatar />
    </div>
  );
}

export default App;
