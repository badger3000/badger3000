import { useState } from 'react'

export default function useColorAPI() {
  const [colors, setColors] = useState([])
  const [status, setStatus] = useState('unloaded')

  const request = async () => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
    const res = await fetch(
      'https://www.colr.org/json/colors/random/3',
      options
    )
    const colors = await res.json()

    setColors(colors)
    setStatus('loaded')
    // if (!query) return
    // const requestColors = async () => {
    //   setStatus('loading')
    //   const options = {
    //     method: 'GET',
    //     headers: {
    //       'X-RapidAPI-Key': process.env.X_RAPIDAPI_KEY,
    //       'X-RapidAPI-Host': 'random-palette-generator.p.rapidapi.com',
    //     },
    //   }
    //   const res = await fetch(
    //     'https://random-palette-generator.p.rapidapi.com/palette/1/3',
    //     options
    //   )
    //   const data = await res.json()
    //   setColors(data.palette)
    //   setStatus('loaded')
    //   console.log(data.palette)
    // }
    // requestColors()
    console.log(res)
  }
  function randomColor() {
    return console.log('This is random colors function')
  }
  return { request, randomColor, colors, status }
}
