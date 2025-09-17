import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Button from './components/Button'

function App() {

  return (
    <>
      <div className=''>
        {/* <Button variant="primary" label={'Click'}/> */}
        <div className='m-10'>

        <Button variant="cancel" label='Continue'/>
        </div>
      </div>
    </>
  )
}

export default App
