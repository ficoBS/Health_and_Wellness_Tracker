import { Outlet } from 'react-router-dom'
import BottomNav from '../BottomNav/BottomNav'

const SecondaryLayout = () => {
    return (
        <>
            <Outlet />
            <BottomNav />
        </>
    )
}

export default SecondaryLayout