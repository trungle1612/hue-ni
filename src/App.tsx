import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { HomePage } from './pages/HomePage'
import { FestivalPage } from './pages/FestivalPage'
import { MyTripPage } from './pages/MyTripPage'
import { ExperiencePage } from './pages/ExperiencePage'
import { DetailsPage } from './pages/DetailsPage'
import { FestivalDetailPage } from './pages/FestivalDetailPage'
import { ExperienceDetailPage } from './pages/ExperienceDetailPage'
import { MyTripProvider } from './contexts/MyTripContext'

function App() {
  return (
    <MyTripProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="festivals" element={<FestivalPage />} />
          <Route path="my-trip" element={<MyTripPage />} />
          <Route path="trai-nghiem" element={<ExperiencePage />} />
        </Route>
        <Route path="details/:id" element={<DetailsPage />} />
        <Route path="festivals/:id" element={<FestivalDetailPage />} />
        <Route path="trai-nghiem/:id" element={<ExperienceDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </MyTripProvider>
  )
}

export default App
