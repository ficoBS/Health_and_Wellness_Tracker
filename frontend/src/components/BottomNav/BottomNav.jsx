import homeLogo from '../../assets/home.svg'
import trainLogo from '../../assets/train.svg'
import chartLogo from '../../assets/chart.svg'
import messageLogo from '../../assets/message.svg'
import profileLogo from '../../assets/user_profile.svg'
import './BottomNav.css'
import { NavLink } from 'react-router-dom'

const BottomNav = () => {

    return (
        <div id='botNav'>
            <div className='botNavItem'>
                <NavLink to='/dashboard' className={({isActive}) => isActive ? "link linkActive" : "link"}>
                    <div>
                        <img src={homeLogo} alt='home' />
                        <p>Home</p>
                    </div>
                </NavLink>
            </div>

            <div className='botNavItem'>
                <NavLink to='/workouts' className={({isActive}) => isActive ? "link linkActive" : "link"}>
                    <div>
                        <img src={trainLogo} alt='train' />
                        <p>Train</p>
                    </div>
                </NavLink>
            </div>

            <div className='botNavItem'>
                <NavLink to='/analytics' className={({isActive}) => isActive ? "link linkActive" : "link"}>
                    <div>
                        <img src={chartLogo} alt='stats' />
                        <p>Stats</p>
                    </div>
                </NavLink>
            </div>

            <div className='botNavItem'>
                <NavLink to='/coaches' className={({isActive}) => isActive ? "link linkActive" : "link"}>
                    <div>
                        <img src={messageLogo} alt='coaches' />
                        <p>Coaches</p>
                    </div>
                </NavLink>
            </div>

            <div className='botNavItem'>
                <NavLink to='/profile' className={({isActive}) => isActive ? "link linkActive" : "link"}>
                    <div>
                        <img src={profileLogo} alt='profile' />
                        <p>Profile</p>
                    </div>
                </NavLink>
            </div>
        </div>
    )
}

export default BottomNav