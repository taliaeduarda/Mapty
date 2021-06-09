"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class Workout {
  date = new Date(); // cutting edge JS
  id = (Date.now() + "").slice(-10); // improvs no id
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // em km
    this.duration = duration; // em min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.descrition = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    }
    ${this.date.getDate()}`;
  }

  click(){
    this.clicks++;
  }
}

class Running extends Workout {
  type = "running";

  constructor(coords, distance, duration, cadence) {
    // exclusivo de running
    super(coords, distance, duration); // comuns a classe pai
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, elevatonGain) {
    // exclusivo
    super(coords, distance, duration); // comuns a classe pai
    this.elevatonGain = elevatonGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// BLUEPRINT
class App {
  // private instance properties
  #map;
  #mapZoomLevel = 13;
  #mapEvent; // props que vão estar presentes em todos os objs criados a partir da classe
  #workouts = [];

  constructor() {
    // Capturando posição do usuário
    this._getPosition();

    // Capturando dados do local storage
    this._getLocalStorage()

    form.addEventListener("submit", this._newWorkout.bind(this));

    // lidando com a mudança de opção
    inputType.addEventListener("change", this._toggleElevationField);

    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
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

    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

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

  _hideForm() {
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

    form.style.display = 'none'
    form.classList.add('hidden')
    setTimeout(() => form.style.display = 'grid', 1000)
  }

  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);

    e.preventDefault();

    // Capturando os dados do form
    const type = inputType.value;
    const distance = +inputDistance.value; // convertendo direto p número
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // Se for corrida, criar um objeto running
    if (type === "running") {
      const cadence = +inputCadence.value;
      // Chechando se os dados são válidos
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert("Inputs have to be positive numbers!");
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // Se for bike, criar um objeto cycling
    if (type === "cycling") {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration) // elevation pode ser negativa
      )
        return alert("Inputs have to be positive numbers!");
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Adicionar novo objeto criado a array workout
    this.#workouts.push(workout);
    console.log(workout);

    // Renderizar workout no mapa como marcador
    this._renderWorkoutMarker(workout);

    // Renderizar workout na lista
    this._renderWorkout(workout);

    // limpa o valor inserido no campo de input
    this._hideForm()

    // set local storage
    this._setLocalStorage()
   
  }

  _renderWorkoutMarker(workout) {
    // parte do codigo que cria o marcador
    // lat e leng são retornados do objeto que o clique no mapa cria
    L.marker(workout.coords) //precisa ser uma array
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.descrition}`)
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.descrition}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;

    if (workout.type === "running")
      html += `
    <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `;

        if (workout.type === 'cycling')
        html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevatonGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
        `;

        form.insertAdjacentHTML('afterend', html)
  }

  _moveToPopup(e){
    const workoutEl = e.target.closest('.workout')   
    
    if(!workoutEl) return;

    const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id)

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      }
    })

    // // usando a public interface
    workout.click()
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts))
  }

  _getLocalStorage(){
    const data = JSON.parse(localStorage.getItem('workouts'))
    console.log(data)

    if(!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work)
    })
  }
}

// Objeto principal
const app = new App();
