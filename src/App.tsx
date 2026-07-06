import React from 'react';
import { T1DAppRouter } from './components/app/T1DAppRouter';
import { useT1DAppController } from './hooks/useT1DAppController';

const App: React.FC = () => {
  const controller = useT1DAppController();
  return <T1DAppRouter controller={controller} />;
};

export default App;
