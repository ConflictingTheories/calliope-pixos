import logo from './logo.svg';
import './App.css';
// import Pixos from 'calliope-pixos';
import Pixos from './dist/bundle';
const PixosAvatar = Pixos['calliope-pixos'].default;
function App() {
  return (
    <div className="App">
      <PixosAvatar/>
    </div>
  );
}

export default App;
