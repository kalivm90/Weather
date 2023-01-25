import "../assets/style.css"
import { apiController } from "./API";

// ASK REDDIT HOW TO FIX .WEATHER BACKGROUND IMAGE SIZE 

const convertTime = require("convert-time");
import { Country }  from 'country-state-city';

// card bg
import clouds from "../assets/images/clouds.webp";
import thunderstorm from "../assets/images/thunderstorm.webp";
import clear from "../assets/images/clear.webp";
import rain from "../assets/images/rain.jpg";
import snow from "../assets/images/snow.jpg";

// card svg 
import thermo from "../assets/images/thermometer.svg";

const Nav = (() => {

    const load = () => {
        animateHamburger()
    }

    const animateHamburger = () => {
        const navToggle = document.querySelector("#nav-toggle");
        const bars = document.querySelectorAll(".bars");
        const sidebar = document.querySelector(".sidebar")

        navToggle.addEventListener("click", () => {

            if (document.body.className != "show-sidebar" && document.body.className != "bodyMobile") {
                document.body.removeAttribute("class");
                document.body.classList.add("show-sidebar");
                sidebar.style.visibility = "visible"
                sidebar.style.display = "flex"
                // sidebar.style.flexDirection = "column"
                _toggleHamburger();
            } else if (document.body.className === "show-sidebar") {
                document.body.classList.remove("show-sidebar")
                sidebar.style.visibility = "hidden"
                sidebar.style.display = "none"
                _toggleHamburger();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth < 960) {
                document.body.className = ""
                document.body.classList.add("bodyMobile");
            } else if (window.innerWidth > 960 || window.innerWidth < 1100) {
                bars.forEach(i => {(i.className === "bars x") ? i.className = "bars" : {}});
                document.body.className = ""
            }
        })

        function _toggleHamburger() {
            bars.forEach(bar => bar.classList.toggle('x'));
        };
    }

    const getSearch = () => {
        const search = document.getElementById("searchField")
        return search.value
    }

    return {load, getSearch}
})();


const Main = (() => {
    const searchButton = document.querySelector("#search");
    const error = document.querySelector(".error");
    const load = () => {
        let location = navigator.geolocation.getCurrentPosition(_geoSuccess, _geoFail);

        // MAY BE ABLE TO REFINE THIS WITH THE GEO SUCCESS
        // async needs to be here to assign promise value to variable
        searchButton.addEventListener("click", async() => {
            const search = Nav.getSearch();   
            const data = await apiController().getWeather(search); 
            _checkApi(data);
            createCard(data);
        }); 
    }

    // HERE ----------------------------------------------------------------------------------------------------------------
    const createCard = (value) => { 
        const descriptionElement = document.getElementById("description");
        descriptionElement.textContent = _createCardDesc(value);

        _setCardBg(value);
        _setDetails(value.main, value.weather[0], value.wind)
        _setIcon(value.weather[0].icon);
        _setGif(value.weather[0].description);

        // all api data
        const weatherData = Object.keys(value)
        // weatherData.forEach(i => console.log(value[i]));
        console.log(value);

    }

    const _setIcon = (iconName) => {
        const icon = document.getElementById("weather-icon");
        console.log(iconName)
        icon.src = `http://openweathermap.org/img/wn/${iconName}@2x.png`
    }

    const _setDetails = (valueOne, valueTwo, valueThree) => {
        const tempEl = document.querySelector("#temp");
        const tempImg = document.querySelector("#tempSVG");
        const weatherDesc = document.querySelector("#weather-desc");
        const bottomList = document.getElementById("bottom-list");

        const info = {
            "temp": valueOne.temp,
            "feelsLike": valueOne.feels_like,
            "desc": valueTwo.description,
        }

        const wind = {
            "Pressure": [valueOne.pressure, "hpa"],
            "Speed": [valueThree.speed, "mph"],
            "Degree": [valueThree.deg, "&#176;"],
            "Gusts": [valueThree.gust, "mph"]
        }

        tempEl.innerHTML = `${info.temp}<span class="text-6xl text-amber-400 font-light">&#8457;</span>`;
        tempImg.src = thermo;
        weatherDesc.textContent = info.desc
        
        const windKey = Object.keys(wind)
        bottomList.innerHTML = "";
        windKey.forEach(item => {
            const li = document.createElement("li");
            if (wind[item][0] === undefined) {
                wind[item][0] = 0;
            }
            li.innerHTML = `${item}: ${wind[item][0]} ${wind[item][1]}`
            li.className = "text-2xl text-white font-bold";
            bottomList.appendChild(li);
        })
    }

    const _setGif = async(value) => {
        const gifElem = document.getElementById("gif");
        const data = await apiController().getGif(value)
        _checkApi(data);
        try {
            const image = data.data.images
            if (image.original.height >= 500) {
                gifElem.src = image.fixed_height_small
            } else {
                gifElem.src = image.original.url
            }
        } catch(error) {
            console.log(error)
            showError("Failed to fetch gif");
        }
    }

    const _createCardDesc = (value) => {
        // find country name from code
        const countryCode = Country.getAllCountries().filter(i => (i.isoCode === value.sys.country));
        // initialize date
        const date = new Date();
        // concat all together for description
        const description = `${value.name}, ${countryCode[0].name} as of ${convertTime(date.getHours() + ":" + date.getMinutes())}`;
        return description
    }

    const _setCardBg = (value) => {
        const id = value.weather[0].id 
        const weatherContainer = document.querySelector(".weather");
        if (id >= 200 && id <= 232) {
            weatherContainer.style.backgroundImage = `url("${thunderstorm}");`;
        } else if (id >= 801 && id <= 804) {
            weatherContainer.style.backgroundImage = `url("${clouds}")`;
        } else if (id === 800) {
            weatherContainer.style.backgroundImage = `url("${clear}")`;
        } else if (id >= 500 && id <= 531) {
            weatherContainer.style.backgroundImage = `url("${rain}")`;
        } else if (id >= 600 && id <= 622) {
            weatherContainer.style.backgroundImage = `url("${snow}")`;
        } else {

        }
    }

    const showError = (message) => {
        error.parentElement.classList.toggle("show-error");
        error.textContent = message
        setTimeout(() => {
            error.parentElement.classList.toggle("show-error");
            error.textContent = ""
        }, 1000);
    }

    // MAY BE ABLE TO REFINE THIS WITH THE EVENT LISTENER
    const _geoSuccess = async(p) => {
        const location = p.coords
        const data = await apiController().getWeather(location);
        _checkApi(data);
        createCard(data);
    }
    
    const _geoFail = (e) => {
        showError(e.message);
    }

    const _checkApi = (data) => {
        if (data.message) {
            showError(data.message)
            return
        }
    }


    return {load};
})();


export const displayController = (() => {
    const renderPage = () => {
        Nav.load();
        Main.load();
    }

    return {renderPage} ;
})();



// const Main = (() => {
//     const searchButton = document.querySelector("#search");
//     const error = document.querySelector(".error");

//     const load = () => {
//         searchButton.addEventListener("click", () => {
//             const search = Nav.getSearch();

//             getAPI(search).then(i => {
//                 createCard(i)
//             });
//         }); 
//     }

//     const createCard = (value) => {
//         if (value.message) {
//             error.textContent = value.message
//         } else {
//             return value.main
//         }
//     }

//     // const showError = (message) => {
//     //     error.textContent = message
//     // }

//     return {load};
// })();