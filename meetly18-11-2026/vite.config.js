import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],build:{outDir:'dist',rollupOptions:{output:{manualChunks:{firebase:['firebase/app','firebase/auth','firebase/firestore','firebase/functions','firebase/app-check'],react:['react','react-dom/client']}}}}});
