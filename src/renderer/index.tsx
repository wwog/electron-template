import React from 'react'
import { Inspector } from 'react-dev-inspector'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Inspector
      onInspectElement={({ codeInfo }) => {
        const { columnNumber, lineNumber, absolutePath } = codeInfo
        const url = `vscode://file/${absolutePath}:${lineNumber}:${columnNumber}`
        window.open(url)
      }}
    />
    <App />
  </React.StrictMode>,
)
