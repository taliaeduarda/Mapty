"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

// API com a posição do usuário, recebe uma função de sucesso e outra de erro
navigator.geolocation.getCurrentPosition(
  function (position) {
    console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    // Criando uma array com as cordenadas
    const coords = [latitude, longitude]

    // Inserindo leaflet dentro da função de sucesso

    const map = L.map("map").setView(coords, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

      // lidando com o clique do usuário no mapa, esse metodo map faz parte do leaflet
      map.on('click', function(mapEvent) {
        console.log(mapEvent)
        const {lat,lng} = mapEvent.latlng

        // parte do codigo que cria o marcador 
        // lat e leng são retornados do objeto que o clique no mapa cria
      L.marker([lat, lng]) //precisa ser uma array
      .addTo(map)
      .bindPopup("Workout")
      .openPopup();
      })
  },
  function () {
    alert("Não foi possível identificar a sua posição");
  }
);

// Usando uma biblioteca de terceiros
