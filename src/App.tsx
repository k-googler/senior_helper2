import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { Home } from './components/Home';
import { AdminMode } from './components/admin/AdminMode';
import { ViewerMode } from './components/viewer/ViewerMode';

function App() {
  const { mode, loadFromStorage } = useStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div className="app">
      {mode === 'home' && <Home />}
      {mode === 'admin' && <AdminMode />}
      {mode === 'viewer' && <ViewerMode />}
    </div>
  );
}

export default App;
