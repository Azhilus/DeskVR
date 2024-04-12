// index.js
import './style.css'
import { Canvas } from '@react-three/fiber'
import ReactDOM from 'react-dom'
import { Environment } from '@react-three/drei'
import Laptop from "./Laptop.jsx"
import { VRButton } from '@react-three/xr'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <>
    <Canvas
      camera={{
        fov: 45,
        near: 0.1,
        far: 2000,
        position: [-3, 1.5, 4]
      }}
    >
      <Laptop />
      <Environment preset="warehouse" />
    </Canvas>
    <VRButton />
  </>
)
