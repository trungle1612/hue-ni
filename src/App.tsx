import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { HomePage } from './pages/HomePage'
import { FestivalPage } from './pages/FestivalPage'
import { MyTripPage } from './pages/MyTripPage'
import { DetailsPage } from './pages/DetailsPage'
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
        </Route>
        <Route path="details/:id" element={<DetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </MyTripProvider>
  )
}

export default App
