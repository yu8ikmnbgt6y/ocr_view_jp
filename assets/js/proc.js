/**
 * Hides all DOM elements with the `alert` class after a delay.
 *
 *
 * @function
 * @param {number} delay - The delay, in mlliseconds, before the elements should be hidden.
 * @returns {void}
 *
 * @throws {TypeError} Thrown if `delay` is not a number.
 * @throws {RangeError} Thrown if `delay` is not positive.
 *
 */
export function hideAllAlertDOMs(delay) {
    
    if (typeof delay != 'number'){
        throw new TypeError('The `delay` parameter must be a number')
    }

    if (delay < 0) {
        throw new RangeError('The `delay` parameter must be > 0.');
    }

    document.querySelectorAll(".alert").forEach(x => {
        x.addEventListener('show.alert', function () {
            setTimeout(function () {
                    x.style.display = "none";
                }, delay);
        });
    });
}

/**
 * Returns the text content of the active item in a dropdown list.
 * 
 * @param {HTMLElement} dropdownList - The dropdown list element to search.
 * @returns {string|null} The text content of the active item in the dropdown list, or null if no active item is found.
 * 
 * @throws {TypeError} Thrown if `dropdownList` is not a valid HTMLElement.
 */
export function getActiveDropdownItemText(dropdownList) {
    if (!(dropdownList instanceof HTMLElement)) {
      throw new TypeError('The `dropdownList` parameter must be a valid HTMLElement.');
    }
  
    const activeItem = dropdownList.querySelector('.active');
    return activeItem ? activeItem.textContent : null;
}