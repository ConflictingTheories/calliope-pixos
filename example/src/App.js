import './App.css';
// In development, the alias 'calliope-pixos' maps to the source directory
import PixosClient from 'calliope-pixos';

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
