import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import QuadtreeRenderer from './components/QuadtreeRenderer';

function App() {
  const points  = [] 

  for (let i = 0; i < 10; i++) {
    const x = Math.random() * 1850
    const y = Math.random() * 1000
    const width = Math.random() * 100 + 50
    const height = Math.random() * 100 + 50
    points.push({ x, y, width, height })
  }
  
  return (
    <div className="App">
      <QuadtreeRenderer width={1920} height={1080} maxDepth={4} maxPoints={10} points={points}/>
      
    </div>
  )
}

export default App
