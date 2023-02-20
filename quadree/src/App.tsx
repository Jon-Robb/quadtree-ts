import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import QuadtreeRenderer from './components/QuadtreeRenderer';

function App() {
  const points  = [] 

  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 800
    const y = Math.random() * 600
    const width = 10
    const height = 10
    points.push({ x, y, width, height })
  }
  console.log(points)

  return (
    <div className="App">
      <QuadtreeRenderer width={800} height={600} maxDepth={4} maxPoints={10} points={points}/>
      
    </div>
  )
}

export default App
