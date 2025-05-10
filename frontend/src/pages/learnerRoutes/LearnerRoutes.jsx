import React, { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUserRole } from '@/redux/features/user/userSlice'

// Lazy load components for better performance
const Dashboard = lazy(() => import('@/components/home/learner/dashboard/dashboard'))
const Roadmap = lazy(() => import('@/components/home/learner/roadmap/Roadmap'))
const Discussions = lazy(() => import('@/components/home/learner/discussions/Discussions'))

function LearnerRoutes() {  
  return (
    <Protector>
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <Routes>
          <Route path="" element={<Dashboard />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="discussions" element={<Discussions />} />
          <Route path="*" element={<Navigate replace to="/404" />} />
        </Routes>
      </Suspense>
    </Protector>
  )
}

export default LearnerRoutes

const Protector = ({children}) => {
  const role = useSelector(selectUserRole)

  if(role !== "learner") {
    return <Navigate to="/home" replace />
  }

  return children
}