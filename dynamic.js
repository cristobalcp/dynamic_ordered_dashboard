/**
 * Funcion que recibe un div con resizer inferior derecho y lo convierte en resizable
 */
function makeResizableDiv(div) {
    const element = document.querySelector(div);
    const resizer = document.querySelector(div + ' .resizer');
    const minimum_size = 20;
    let original_width = 0;
    let original_height = 0;
    let original_mouse_x = 0;
    let original_mouse_y = 0;

    // Le añadimos un escuchador mousedown al resizer
    resizer.addEventListener('mousedown', function (evt) {
        evt.preventDefault();
        original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
        original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
        original_x = element.getBoundingClientRect().left;
        original_y = element.getBoundingClientRect().top;
        original_mouse_x = evt.pageX;
        original_mouse_y = evt.pageY;

        // Cuando el mousedown este activo escucha tambien mousemove (resize) y mouseup (stop) en la ventana
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
    });

    /*
     * Funcion de resize personalizada 
     */
    function resize(evt) {
        const width = original_width + (evt.pageX - original_mouse_x);
        const height = original_height + (evt.pageY - original_mouse_y);
        if (width > minimum_size) {
            element.style.width = width + 'px';
        }
        if (height > minimum_size) {
            element.style.height = height + 'px';
        }
    }
    /*
     * Funcion que elimina el escuchador de mousemovelos escuchadores y reordena los elementos si hay resize
     */
    function stopResize() {
        if (original_width != element.style.width.replace('px', '') || original_height != element.style.height.replace('px', '')){
            fullOrder(element.parentElement);
        }
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
    }

}

/** 
 * Ordena una lista de elementos de manera optima dependiendo del ancho disponible
*/
function fullOrder(container) {
    // Ordena los elementos por el ancho actual
    const totalSpace = container.clientWidth;
    const items = Array.from(container.children).map((element) => {
        return {
            element,
            used: false,
            width: getElementWidth(element),
        };
    });
    const totalItems = items.length;

    console.log('Total divs a ordenar: ' + totalItems);

    // El primer elemento se queda en la primera posicion
    const firstItem = items[0];
    const sortedElements = [firstItem.element];

    firstItem.used = true;

    // Calculamos el espacio restante de la primera fila
    let availableSpace = totalSpace - firstItem.width;

    // Ordenamos el resto de elementos:
    for (let i = 1; i < totalItems; ++i) {
        const bestFitIndex = getBestFit(items, availableSpace);

        let item;

        if (bestFitIndex === -1) {
            //  Si no hay nigun elemento que quepa seleccionamos el
            // primer elemento sin usar para mantener el orden inicial 
            // lo maximo posible:
            item = getFirstNotUsed(items);
            availableSpace = totalSpace - item.width;
        } else {
            item = items[bestFitIndex];
            availableSpace -= item.width;
        }

        sortedElements.push(item.element);
        item.used = true;
    }

    sortedElements.forEach((element) => {
        // Cuando hacemos appendo de un elemento que ya es un hijo no
        // se duplica, se elimina de su posicion inicial y se vuelve a introducir ordenado:

        container.appendChild(element);
    });

    console.log("ORDENADOS");

    /**
    * Devuelve el width actual del elemento, teniendo en cuenta el margen tambien
    */
    function getElementWidth(element) {
        const style = window.getComputedStyle(element);

        // Margins deben estar en px:
        return element.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
    }

    /**
    * Encuentra el index del elemento mas ancho que quepa en el espacio actual (devuelve -1 si no cabe ninguno)
    */
    function getBestFit(elements, availableSpace) {
        let minAvailableSpace = availableSpace;
        let bestFitIndex = -1;

        elements.forEach((element, i) => {
            if (element.used) {
                return;
            }

            const elementAvailableSpace = availableSpace - element.width;

            if (elementAvailableSpace >= 0 && elementAvailableSpace < minAvailableSpace) {
                minAvailableSpace = elementAvailableSpace;
                bestFitIndex = i;
            }
        });

        return bestFitIndex;
    }

    /**
    * Encuentra el primer elemento que aun no se ha usado
    */
    function getFirstNotUsed(elements) {
        for (let element of elements) {
            if (!element.used) {
                return element;
            }
        }
    }

}