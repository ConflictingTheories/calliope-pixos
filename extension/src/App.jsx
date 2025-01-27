import "./App.css"
import Pixos from 'calliope-pixos';
const PixosClient = Pixos['calliope-pixos'].default;

function App() {
  return (
    <div className="App">
      <PixosClient />
    </div>
  );
}

export default App;
