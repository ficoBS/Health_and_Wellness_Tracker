import { useState, useEffect } from "react";
import axios from 'axios'
import { AuthContext } from './AuthContext'

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get("http://localhost:5000/api/auth/me",
          {withCredentials: true}
        );
        setUser(result.data);
      } catch (error) {
        setUser(null);
        console.log('Could not fetch user: ' + error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();

    console.log(user);
  }, [])

  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", 
        {},
        {withCredentials: true}
      );
      setUser(null);
    } catch (error) {
      console.log("Logout failed.");
    }
  }

  return (
    <AuthContext.Provider value={{user, setUser, loading, logout}}>
        {children}
    </AuthContext.Provider>
  )
}