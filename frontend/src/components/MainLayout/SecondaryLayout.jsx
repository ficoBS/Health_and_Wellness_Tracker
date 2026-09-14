import { Outlet } from 'react-router-dom'
import BottomNav from '../BottomNav/BottomNav'

const SecondaryLayout = () => {
    return (
        <div className="app-shell app-shell-secondary">
            <div className="app-content">
                <Outlet />
            </div>
            <BottomNav />
        </div>
    )
}

export default SecondaryLayout