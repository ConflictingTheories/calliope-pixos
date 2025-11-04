import './App.css';
import Pixos from 'calliope-pixos';
const PixosClient = Pixos['calliope-pixos'].default;

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const isNetworked = urlParams.get('network') === 'true';
  const manifest = isNetworked ? 'manifest.network.json' : 'manifest.local.json';

  return (
    <div className="App" width="650px">
      <PixosClient manifest={`/spritz/${manifest}`} />
    </div>
  );
}

export default App;
