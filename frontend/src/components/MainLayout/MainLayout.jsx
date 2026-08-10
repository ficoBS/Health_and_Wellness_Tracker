import { Outlet } from 'react-router-dom'
import BottomNav from '../BottomNav/BottomNav'
import TopNav from '../TopNav/TopNav'

const MainLayout = () => {
    return (
        <>
            <TopNav />
            <Outlet />
            <BottomNav />
        </>
    )
}

export default MainLayout