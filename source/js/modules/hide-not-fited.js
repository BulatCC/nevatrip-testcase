const hideNotFited = () => {
    const elementsContainer = document.querySelectorAll('[data-hide-not-fited]');
    elementsContainer.length && elementsContainer.forEach(container => {
        const visibleBlock = container.querySelector('[data-visible-block]');
        const visibleElements = Array.from(visibleBlock.querySelectorAll('[data-fit-item]'));

        // функция для сравнения ширины контейнера с общей шириной дочерних элементов
        const compareWidth = () => {
            const visibleBlockWidth = visibleBlock.offsetWidth;
            const allElementsWidth = visibleElements.reduce((acc, el) => {
                const elWIdth = Math.floor(el.offsetWidth);
                const elMargin = +window.getComputedStyle(el).marginLeft.replace(/[^\d\+]/g, '');
                const fullElWidth = elWIdth + elMargin;
                acc += fullElWidth;
                return acc;
            }, 0);
            return visibleBlockWidth < allElementsWidth;
        }

        if (compareWidth()) {
            // создаем контейнер для скрытых елементов
            const hiddenBlockTemplate = `<div class="hidden-block" data-hidden-block></div>`;
            container.insertAdjacentHTML('beforeend', hiddenBlockTemplate);
            const hiddenBlock = container.querySelector('[data-hidden-block]');
            const hiddenElements = [];
            let isDropDownActive = false;

            // получаем данные для кнопки "ещё" из дата атрибута
            const buttonData = JSON.parse(visibleBlock.getAttribute('data-button'));
            const { text, className } = buttonData;
            const showMoreBtnTemplate = `<button class="hidden-button ${className}" data-show-more-btn>${text}</button>`;

            // функция для вставки дом элементов в дом дерево
            const insertElements = () => {
                hiddenElements.push(visibleElements[visibleElements.length - 1]);
                hiddenBlock.prepend(hiddenElements[hiddenElements.length - 1]);
                visibleElements.length = visibleElements.length - 1;
                visibleBlock.innerHTML = '';
                visibleElements.forEach(el => {
                    visibleBlock.append(el);
                });
            }

            // пока условие истинно вставляем элементы
            while (compareWidth()) {
                insertElements();
            }

            // вставляем элемент еще один раз, чтобы было место для кнопки "ещё"
            insertElements();

            // вставляем кнопку "ещё" в дом дерево
            visibleBlock.insertAdjacentHTML('beforeend', showMoreBtnTemplate);
            const showMoreBtn = container.querySelector('[data-show-more-btn]');
            container.style.width = 'fit-content';

            // добавляем обработчики на открытие/закрытие дропдауна
            const handleCloseDropdown = (evt) => {
                if (!evt.target.closest(`.${className}`) && isDropDownActive) {
                    hiddenBlock.classList.toggle('active');
                    isDropDownActive = false;
                    window.removeEventListener('click', handleCloseDropdown);
                }
            }

            showMoreBtn.addEventListener('click', () => {
                hiddenBlock.classList.toggle('active');
                isDropDownActive = true;
                window.addEventListener('click', handleCloseDropdown);
            });
        }
    });
};

export { hideNotFited };
