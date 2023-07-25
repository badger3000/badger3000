import Swup from 'swup'
import SwupA11yPlugin from '@swup/a11y-plugin'
import SwupHeadPlugin from '@swup/head-plugin'
import SwupSlideTheme from '@swup/slide-theme'

//page transitions
const swup = new Swup({
  plugins: [new SwupA11yPlugin(), new SwupHeadPlugin(), new SwupSlideTheme()],
})
//mobile menu
const mobileMenu = () => {
  //hamburger menu toggle
  document.querySelector('button').addEventListener('click', () => {
    //hide / show navigation on mobile
    document.querySelector('ul').classList.toggle('mobile-menu')
    //prevent scrolling on mobile when navigation is open
    document.querySelector('body').classList.toggle('overflow-hidden')
    //animate hamburger menu
    const bars = document.querySelectorAll('.top-bar, .middle-bar, .bottom-bar')
    bars.forEach((bar) => {
      bar.classList.toggle('animate')
    })
  })
}
document.addEventListener('DOMContentLoaded', mobileMenu)
