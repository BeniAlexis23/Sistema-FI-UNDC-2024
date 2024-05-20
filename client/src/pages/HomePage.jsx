import '../App.css'
import Actualidad from '../components/Actualidad'
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
      <Newsletter />
      <Aacademica />
      <Actualidad />
      <SInformacion />
      <Footer />
    </>
  )
}

export default HomePage
