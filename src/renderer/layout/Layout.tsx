import { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { cx } from '@style/css'
import { layoutContainer } from './css'

//#region component Types
export interface LayoutProps {
  className?: string
  style?: React.CSSProperties
}
//#endregion component Types

//#region component
export const Layout: FC<LayoutProps> = (props) => {
  const { className, style } = props
  return (
    <div id="win-container" className={cx(className, layoutContainer)} style={style}>
      <div id="win-header"></div>
      <div id="win-context">
        <Outlet />
      </div>
    </div>
  )
}
//#endregion component
