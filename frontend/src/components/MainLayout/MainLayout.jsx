import { Outlet } from 'react-router-dom'
import BottomNav from '../BottomNav/BottomNav'
import TopNav from '../TopNav/TopNav'

const MainLayout = () => {
    return (
        <div className="app-shell">
            <TopNav />
            <div className="app-content">
                <Outlet />
            </div>
            <BottomNav />
        </div>
    )
}

export default MainLayout