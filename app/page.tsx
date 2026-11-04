import Navbar from "@/components/navbar"
import Diorama from "@/components/diorama/Diorama"
import HomeContent from "@/components/home-content"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Diorama />
        <HomeContent />
      </main>
      <Footer />
    </>
  )
}
