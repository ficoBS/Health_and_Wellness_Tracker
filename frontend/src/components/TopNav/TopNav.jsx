import bigLogo from '../../assets/big_logo.png'
import userLogo from '../../assets/user_logo.svg'
import './TopNav.css'
import { useAuth } from '../../context/useAuth'

const TopNav = () => {
    const {user, setUser, logout} = useAuth();

    return (
        <div id='topNav'>
            <div id='logo'>
                <img src={bigLogo} alt='bigLogo' />
            </div>
            <div id='profile'>
                {!user.image ?
                <img src={userLogo} alt='userLogo' /> :
                <img src={user.image} alt='userLogo' />}

                
                {user.first_name} {user.last_name}
                <button onClick={logout}>Logout</button>
            </div>
        </div>
    )
}

export default TopNav