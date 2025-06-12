import LandingPage from './LandingPage';
import Chat from './Chat';

function App() {
  return (
    <>
      <LandingPage />
      <div id="chat-demo" style={{ paddingTop: 40 }}>
        <Chat />
      </div>
    </>
  );
}

export default App;
