import React, { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUserRole } from '@/redux/features/user/userSlice'

// Lazy load components for better performance
const CoursesTable = lazy(() => import('@/components/home/curator/courses/CoursesTable'))
const RoadmapStepManager = lazy(() => import('@/components/home/curator/roadmap-step/RoadmapStepManager'))
const ResourceManager = lazy(() => import('@/components/home/curator/learning-resource/ResourceManager'))

function CuratorRoutes() {
  return (
    <Protector>
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <Routes>
          <Route path="" element={<CoursesTable />} />
          <Route path="roadmap-step" element={<RoadmapStepManager />} />
          <Route path="learning-resource" element={<ResourceManager />} />
          <Route path="*" element={<Navigate replace to="/404" />} />
        </Routes>
      </Suspense>
    </Protector>
  )
}

export default CuratorRoutes

const Protector = ({children}) => {
  const role = useSelector(selectUserRole)
  
  if(role !== "curator") {
    return <Navigate to="/home" replace />
  }
  
  return children
}