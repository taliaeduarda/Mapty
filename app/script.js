"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class Workout {
  date = new Date() // cutting edge JS
  id = (Date.now() + '').slice(-10) // improvs no id

  constructor(coords, distance, duration) {

    this.coords = coords // [lat, lng]
    this.distance = distance // em km
    this.duration = duration // em mnts
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) { // exclusivo de running
    super(coords, distance, duration) // comuns a classe pai
    this.cadence = cadence
    this.calcPace()
  }
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance
    return this.pace
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevatonGain) { // exclusivo
    super(coords, distance, duration) // comuns a classe pai
    this.elevatonGain = elevatonGain
    this.calcSpeed()
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60)
    return this.speed
  }
}

// test
const run1 = new Running([39, -12], 5.2, 24, 178)
const cycling1 = new Cycling([39, -12], 27, 95, 523)
console.log(cycling1)
console.log(run1)

// BLUEPRINT
class App {
  // private instance properties
  #map;
  #mapEvent; // props que vão estar presentes em todos os objs criados a partir da classe

  constructor() {
    // garantindo que o metodo vai ser chamado assim que a aplicação carregar
    this._getPosition();

    form.addEventListener("submit", this._newWorkout.bind(this));

    // lidando com a mudança de opção
    inputType.addEventListener("change", this._toggleElevationField);
  }

  _getPosition() {
    // API com a posição do usuário, recebe uma função de sucesso e outra de erro
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this), // função de sucesso

        function () {
          alert("Não foi possível identificar a sua posição");
        }
      );
  }

  _loadMap(position) {
    console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    // Criando uma array com as cordenadas
    const coords = [latitude, longitude];

    // Inserindo leaflet dentro da função de sucesso

    this.#map = L.map("map").setView(coords, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // lidando com o clique do usuário no mapa, o metodo map faz parte do leaflet
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    // Mostrar o form assim que o user clica no mapa
    form.classList.remove("hidden");

    // Automaticamente foca no input distance
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    e.preventDefault();

    // limpa o valor inserido no campo de input
    inputDistance.value = inputDuration.value = inputCadence.value = "";
    // mostra o marcador
    const { lat, lng } = this.#mapEvent.latlng;

    // parte do codigo que cria o marcador
    // lat e leng são retornados do objeto que o clique no mapa cria
    L.marker([lat, lng]) //precisa ser uma array
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "running-popup",
        })
      )
      .setPopupContent("Workout")
      .openPopup();
  }
}

// Objeto principal
const app = new App();
