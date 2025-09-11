import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { updatePermissions } from '@/utils/auth'
import App from './App.tsx'

// 初始化权限
updatePermissions();

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
