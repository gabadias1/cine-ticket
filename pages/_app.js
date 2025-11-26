import '../styles/globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { AnimatePresence } from "framer-motion";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className={inter.className}>
        <AnimatePresence mode="wait">
          <Component {...pageProps} />
        </AnimatePresence>
      </div>
    </AuthProvider>
  );
}