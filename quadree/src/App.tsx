import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import QuadtreeRenderer from './components/QuadtreeRenderer';

function App() {
  const points  = [] 

  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * 1850 + 33
    const y = Math.random() * 1000 + 33
    const width = Math.random() * 32
    const height = Math.random() * 32
    points.push({ x, y, width, height })
  }
  
  return (
    <div className="App">
      <QuadtreeRenderer width={1920} height={1080} maxDepth={4} maxPoints={10} points={points}/>
      
    </div>
  )
}

export default App
