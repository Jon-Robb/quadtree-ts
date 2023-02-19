import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import QuadtreeRenderer from './components/QuadtreeRenderer';

function App() {
  const points  = [] 

  for (let i = 0; i < 1000; i++) {
    points.push({x: Math.random() * 800, y: Math.random() * 600})
  }

  return (
    <div className="App">
      <QuadtreeRenderer width={800} height={600} maxDepth={4} maxPoints={10} points={points}/>
        
    </div>
  )
}

export default App
