import Header from "./components/header/header.component";
import './i18n';

import {
  Toaster
}

  from "react-hot-toast";

import {
  Routes
}

  from "./routes/routes";
import "./index.css";

import {
  useEffect
}

  from 'react';
import Footer from "./components/footer/footer.component";
import ButtonScroll from "./components/home/buttonScroll.component";
import ChatWidget from "./components/chat/ChatWidget";

function App() {
  function ScrollToSection() {
    useEffect(() => {
      const hash = window.location.hash;

      if (hash) {
        const element = document.querySelector(hash);

        if (element) {
          element.scrollIntoView({
            behavior: 'smooth'
          }

          );
        }
      }
    }

      , []);
    return null;
  }

  return (<div className="min-h-screen bg-white"> <ScrollToSection /> <Header /> <Routes /> <Footer /> <Toaster /> <ButtonScroll /> <ChatWidget /> </div>);
}

export default App;