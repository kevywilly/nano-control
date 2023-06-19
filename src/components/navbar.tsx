import {NavLink, Outlet} from "react-router-dom";
import React from "react";

export const NavBarItem = (props: { name: string, route: string }) => {
    const {name, route} = props
    return (
        <div>
            <NavLink
                to={route}
                className={({isActive}) => isActive ? 'navbar-item-selected' : undefined}
            >
                {name}
            </NavLink>

        </div>
    )
}

export default function NavBar(){
    return <>
            <div className="navbar">
                <NavBarItem name="Dashboard" route="/"/>
                <NavBarItem name="Training" route="/training"/>
                <div className="flex-grow"></div>
            </div>
            <div>
                <Outlet/>
            </div>
        </>
}