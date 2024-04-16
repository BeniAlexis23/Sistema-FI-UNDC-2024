import '../App.css'
import About from '../components/About'
import Aacademica from '../components/Aacademica'
import Home from '../components/Home'
import Navbar from '../components/Navbar'
import Newsletter from '../components/Newsletter'
import SInformacion from '../components/SInformacion'
import Footer from '../shared/Footer'

const HomePage = () => {
  return (
    <>
      <Navbar />
      <Home />
      <Aacademica />
      <About />
      <SInformacion />
      <Newsletter />
      <Footer />
    </>
  )
}

export default HomePage
