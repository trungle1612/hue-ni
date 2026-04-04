import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { HomePage } from './pages/HomePage'
import { HeritagePage } from './pages/HeritagePage'
import { MyTripPage } from './pages/MyTripPage'
import { DetailsPage } from './pages/DetailsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="heritage" element={<HeritagePage />} />
          <Route path="my-trip" element={<MyTripPage />} />
        </Route>
        <Route path="details/:id" element={<DetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
