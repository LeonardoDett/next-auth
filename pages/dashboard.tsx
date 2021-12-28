import { useContext, useEffect } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { api } from "../services/api"

export default function Dashboard() {

  useEffect(() => {
    api.get('/me')
    .then(response => console.log(response))
    .catch(error => console.log(error))
  }, [])
  const { user } = useContext(AuthContext)

  return (
    <h1>Dash: {user?.email}</h1>
  )
}