import logo from './logo.svg';
import './App.css';
import Pixos from 'calliope-pixos';
const PixosAvatar = Pixos['calliope-pixos'].default;
function App() {
  return (
    <div className="App">
      <PixosAvatar/>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;