import React from "react";
import "./style.scss";
import { NavLink } from "react-router-dom";


function Header() {


  // Creation fonction menu Burger
  let isBurgerOpen = false;
  function burgerToggle() {
    const nav = document.querySelector(".header__nav");
    console.log(nav);
    nav.classList.toggle("active");
    isBurgerOpen = !isBurgerOpen;
  }
  // Fin fonction menu Burger

  return (
    <>
      <div className="header">
        <nav className="header__nav">
          <ul onClick={burgerToggle}>


            <li>
              <NavLink to="/"><img src="assets/logo-pix-dark.png" alt=""  className="logo" /> </NavLink>
            </li>
            <li>
              <NavLink to="/missions">Fiches missions</NavLink>
            </li>
            <li>
              <NavLink to="/reports">Rapports d'intervention</NavLink>
            </li>
            <li>
              <NavLink to="/incidents">Fiches incidents</NavLink>
            </li>
            <li>
              <NavLink to="/tech">Techniciens</NavLink>
            </li>
      
          </ul>
          <div className="header__burgerMenu" onClick={burgerToggle}></div>
        </nav>
      </div>
    </>
  );
}

export default Header;
