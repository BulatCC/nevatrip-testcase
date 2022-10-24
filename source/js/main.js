import { hideNotFited } from './modules/hide-not-fited';
import { ticketChoice } from './modules/ticket-choice';

// ---------------------------------

window.addEventListener('DOMContentLoaded', () => {
    hideNotFited();
    ticketChoice();
});

