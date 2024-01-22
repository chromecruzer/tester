import {useLocation} from "react-router-dom";

export const DebugRouter = ({ children }: { children: any }) => {
  const location = useLocation()
  if (process.env["NODE_ENV"] === 'development') {
    console.log(
      `Route: ${location.pathname}${location.search}, State: ${JSON.stringify(location.state)}`,
    )
  }
  return children
}
