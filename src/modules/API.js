export const apiController = () => {
    const getWeather = async(search) => {
        const key = process.env.WEATHER;
        let response;
        try {
            if (typeof(search) === "string") {
                response = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${search}&APPID=${key}&units=imperial`);
            } else {
                const lat = search.latitude
                const lon = search.longitude
                response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=imperial`);
            }
            const weather = await response.json();
            return weather;
        } catch (error) {
            return {error};
        }
    }

    const getGif = async(search) => {
        const key = process.env.GIF;
        try {
            const gif = await fetch(`https://api.giphy.com/v1/gifs/translate?api_key=${key}&s=${search}`, {mode: "cors"});
            const response = await gif.json();
            console.log(response)
            return response
        } catch(error) {
            console.log(error)
        }
    }
    
    return {getWeather, getGif};
};


