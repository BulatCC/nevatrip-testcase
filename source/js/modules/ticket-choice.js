import dayjs from "dayjs";

const ROUTE = {
    AtoB: 'from A to B',
    BtoA: 'from B to A',
    AtoBthenBtoA: 'from A to B and back to A',
}

const { AtoB, BtoA, AtoBthenBtoA } = ROUTE;

class TicketChoice {
    constructor(routeContainer) {
        this.routeContainer = routeContainer;
        this.timeContainerAtoB = document.querySelector('[data-time-a-to-b]');
        this.timeContainerBtoA = document.querySelector('[data-time-b-to-a]');
        this.button = document.querySelector('button');
        this.input = document.querySelector('input');
        this.tooltip = document.querySelector('span');
        this.message = document.querySelector('p');
        this.inputContainer = document.querySelector('[data-container]');
        this.timeZoneOffset = new Date().getTimezoneOffset() / -60;
        this.routeData = [
            { value: AtoB, text: AtoB },
            { value: BtoA, text: BtoA },
            { value: AtoBthenBtoA, text: AtoBthenBtoA },
        ];
        this.timeData = {
            AtoB: [
                { value: '2021-08-21 18:00:00', text: `${AtoB}` },
                { value: '2021-08-21 18:30:00', text: `${AtoB}` },
                { value: '2021-08-21 18:45:00', text: `${AtoB}` },
                { value: '2021-08-21 19:00:00', text: `${AtoB}` },
                { value: '2021-08-21 19:15:00', text: `${AtoB}` },
                { value: '2021-08-21 21:00:00', text: `${AtoB}` },
            ],
            BtoA: [
                { value: '2021-08-21 18:45:00', text: `${BtoA}` },
                { value: '2021-08-21 19:00:00', text: `${BtoA}` },
                { value: '2021-08-21 19:15:00', text: `${BtoA}` },
                { value: '2021-08-21 21:00:00', text: `${BtoA}` },
                { value: '2021-08-21 21:50:00', text: `${BtoA}` },
                { value: '2021-08-21 21:55:00', text: `${BtoA}` },
            ],
        };
        this.choosenValues = {
            route: null,
            [AtoB]: null,
            [BtoA]: null,
            ticketsNumber: null,
        };
        this.tripDuration = 40;
        this.tripPriceOneDirection = 700;
        this.roundtripPrice = 1200;
        this.calculatedPrice = null;
        this.isAtoBrendered = false;
        this.isReadyForCalculate = false;
        this.addRouteChoice();
        this.setListners();
        this.renderRoutes();
    }

    // форматируем время с учетом часового пояса
    formatTime(time) {
       return time && dayjs(time).add(this.timeZoneOffset, 'hour').format('HH:mm');
    }

    // шаблон селекта
    selectTemplate(id, name, data, dataId = '') {
        return `<div class="select-container" data-${dataId}>
            <label for="${id}" style="margin-right: 1rem;">${name}</label>
            <select name="${id}" id="${id}">
                <option disabled selected>${name}</option>
                ${data.map(({ value, text }) => {
            return `<option value="${value}">${text === value ? value : `${this.formatTime(value)} ${text}`}</option>`
        }).join('')}
            </div>
        </select>`;
    }

    // рендерит селект
    renderTime(route) {
        switch (route) {
            case AtoB:
                return this.renderAtoBSelect();
            case BtoA:
                return this.renderBtoASelect();
            case AtoBthenBtoA:
                return this.renderAtoBSelect();
        }
    }

    // работает с селектом выбора маршрута
    addRouteChoice(evt) {
        for (let value in this.choosenValues) {
            this.choosenValues[value] = null;
        }
        if (evt) {
            this.choosenValues.route = evt.target.value;
            this.timeContainerAtoB.innerHTML = '';
            this.timeContainerBtoA.innerHTML = '';
            this.renderTime(evt.target.value);
            this.addTimeChoice();
            this.isAtoBrendered = false;
            this.message.innerHTML = '';
        }
    }

    // работает с селектом выбора времени и направления
    addTimeChoice(evt) {
        if (!evt) return
        switch (this.choosenValues.route) {
            case AtoB:
                return this.choosenValues[AtoB] = evt.target.value;
        }
        switch (this.choosenValues.route) {
            case BtoA:
                return this.choosenValues[BtoA] = evt.target.value;
        }
        switch (this.choosenValues.route) {
            case AtoBthenBtoA:
                if (evt.target.closest('[data-a-to-b]')) {
                    this.choosenValues[AtoB] = evt.target.value;
                    const filteredDates = this.wayBackFilterTime();
                    this.timeContainerBtoA.innerHTML = '';
                    this.renderBtoASelect(filteredDates);
                }

                if (evt.target.closest('[data-b-to-o]')) {
                    this.choosenValues[BtoA] = evt.target.value;
                }
        }
    }

    // убирает не подходящие по времени значения обратного пути
    wayBackFilterTime() {
        return this.timeData.BtoA.filter(({ value }) => {
            const timePlusTripDuration = dayjs(value).subtract(this.tripDuration, 'minute');
            return timePlusTripDuration.isAfter(this.choosenValues[AtoB]);
        });
    }

    // рендерит маршруты
    renderRoutes() {
        this.routeContainer.insertAdjacentHTML('beforeend', this.selectTemplate('route', 'Choose-route', this.routeData));
    }

    // рендерит селект из A в B
    renderAtoBSelect() {
        !this.isAtoBrendered && this.timeContainerAtoB.insertAdjacentHTML('beforeend', this.selectTemplate(`time-to-${AtoB}`, `Choose time ${AtoB}`, this.timeData.AtoB, 'a-to-b'));
        this.isAtoBrendered = true;
    }

    // рендерит селект из B в A
    renderBtoASelect(timeData = this.timeData.AtoB) {
        this.timeContainerBtoA.insertAdjacentHTML('beforeend', this.selectTemplate(`time-to-${BtoA}`, `Choose time ${BtoA}`, timeData, 'b-to-o'));
    }

    // проверяте можно ли показывать поле выбора количества билетов и кнопку расчета
    calculationPrepare() {
        const conditionOne = this.choosenValues.route === AtoB && this.choosenValues[AtoB] || this.choosenValues.route === BtoA && this.choosenValues[BtoA];
        const conditionTwo = this.choosenValues.route === AtoBthenBtoA && this.choosenValues[AtoB] && this.choosenValues[BtoA];
        if (conditionOne || conditionTwo) {
            this.isReadyForCalculate = true;
            this.inputContainer.style.visibility = 'visible';
        } else {    
            this.isReadyForCalculate = false;
            this.inputContainer.style.visibility = 'hidden';
        }
    }

    // расчет цены
    calculate() {
        this.choosenValues.ticketsNumber = this.input.value;
        if (!this.choosenValues.ticketsNumber) {
            this.tooltip.style.opacity = '1';
            return setTimeout(() => this.tooltip.style.opacity = '0', 3000);
        }

        if (this.choosenValues[AtoB] || this.choosenValues[BtoA]) {
            this.calculatedPrice = this.choosenValues.ticketsNumber * this.tripPriceOneDirection;
        }
        if (this.choosenValues[BtoA]) {
            this.calculatedPrice = this.choosenValues.ticketsNumber * this.roundtripPrice;
        }
    }

    // расчет длительности путешествия
    getTripDuration() {
        const getDuration = (timeInminutes) => {
            const hours = Math.floor(timeInminutes / 60);
            const minutes = timeInminutes % 60;
            return `${hours > 0 ? hours : 0}:${minutes}`
        }
        if (this.choosenValues.route === AtoB || this.choosenValues.route === BtoA) {
            return `${this.tripDuration} minutes`;
        }
        if (this.choosenValues.route === AtoBthenBtoA) {
            const diff = dayjs(this.choosenValues[BtoA]).diff(this.choosenValues[AtoB], 'minute');
            return getDuration(diff);
        }
    }

    // сообщение о выбранных билетах
    createMessage() {
        return `You have choosen ${this.choosenValues.ticketsNumber} tickets by the route ${this.choosenValues.route}, cost ${this.calculatedPrice}$.
        This trip will take you ${this.getTripDuration()}. 
        The ship is leaving at ${this.formatTime(this.choosenValues[AtoB]) || this.formatTime(this.choosenValues[BtoA])} ${this.choosenValues.route === AtoBthenBtoA ?`, and arrive at ${this.formatTime(this.choosenValues[BtoA])}` : ''}.`
    }

    // добавляет обработчики событий
    setListners() {
        this.timeContainerAtoB.addEventListener('change', (evt) => {
            this.addTimeChoice(evt);
            this.calculationPrepare();
        });

        this.timeContainerBtoA.addEventListener('change', (evt) => {
            this.addTimeChoice(evt);
            this.calculationPrepare();
        });

        this.routeContainer.addEventListener('change', (evt) => {
            this.addRouteChoice(evt);
            this.calculationPrepare();
        });

        this.button.addEventListener('click', (evt) => {
            evt.preventDefault();
            this.calculate();
            this.message.innerHTML = '';
            this.message.textContent = this.createMessage()
        })
    }
}

const ticketChoice = () => {
    const routeContainer = document.querySelector('[data-route]');
    if (!routeContainer) return;

    new TicketChoice(routeContainer);
}

export { ticketChoice };