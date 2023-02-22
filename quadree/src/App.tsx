import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import QuadtreeRenderer from './components/QuadtreeRenderer';

function App() {
  const points  = [] 

  for (let i = 0; i < 10; i++) {
    const x = Math.random() * 800
    const y = Math.random() * 600
    const width = Math.random() * 10 + 5 
    const height = Math.random() * 10 + 5
    points.push({ x, y, width, height })
  }

  return (
    <div className="App">
      <QuadtreeRenderer width={800} height={600} maxDepth={4} maxPoints={10} points={points}/>
      
    </div>
  )
}

export default App
