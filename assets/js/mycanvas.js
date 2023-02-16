import * as config from "./config.js"

const canvas = document.getElementById("ocr_canvas");
const ocr_result_rect_list = document.getElementById('ocr_result_rect_list')

function resetOcrResultRectList() {
    while (ocr_result_rect_list.firstChild) {
        ocr_result_rect_list.firstChild.remove()
    }
}

/**
 * Resets the canvas and rectangle list.
 * @param {HTMLElement} resultRectList - The rectangle list element to reset
 */
export function resetCanvas() {
    const ctx = canvas.getContext('2d')

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    canvas.width = config.MaxCanvasWidth
    canvas.height = Math.round(config.MaxCanvasWidth / 2.0)

    resetOcrResultRectList()
}

export function adjustBoxes() {

    const scale = ocr_result_rect_list.dataset.scale
    ocr_result_rect_list.childNodes.forEach(rect =>
    {
        const _x = canvas.offsetLeft + (rect.dataset.x * scale)
        const _y = canvas.offsetTop + (rect.dataset.y * scale)
        const _w = (rect.dataset.w * scale)
        const _h = (rect.dataset.h * scale)
    
        rect.style.left = `${Math.round(_x)}px`
        rect.style.top = `${Math.round(_y)}px`
        rect.style.width = `${Math.round(_w)}px`
        rect.style.height = `${Math.round(_h)}px`
    });
}


export function setBoxes(boxes, scale) {

    resetOcrResultRectList()

    for (const box of boxes) {
        const [x, y ,w, h, context] = box

        const rectElem = document.createElement('p')
        rectElem.classList.add('ocr_result_rect')
        rectElem.style.display = 'none'; // 位置調整前なので非表示
        
        rectElem.dataset.x = x;
        rectElem.dataset.y = y;
        rectElem.dataset.w = w;
        rectElem.dataset.h = h;
        
        // ocr結果文字列の格納
        const content_string_span = document.createElement('span')
        content_string_span.textContent = context
        content_string_span.classList.add('ocr_result_string')
        rectElem.appendChild(content_string_span)
        
        ocr_result_rect_list.dataset.scale = scale
        ocr_result_rect_list.appendChild(rectElem)
    }
    
    // 位置調整
    adjustBoxes()

    // 位置調整が終わったので表示
    ocr_result_rect_list.childNodes.forEach(x =>
        x.style.display = ''
    )
}

async function loadImageFromDataURL(src) {
    let image = null
    let promise = new Promise(function (resolve) {
        image = new Image()
        image.onload = function () {
            resolve()
        }
        image.src = src
    })
    await promise
    return image
}

function loadAsDataURL(image_file) {
    return new Promise((resolve, reject) => {
        let file_data = new FileReader()
        file_data.onload = function () {
            resolve(file_data.result)
        }
        file_data.onerror = function () {
            reject(new Error('Failed to read file.'))
        }
        file_data.readAsDataURL(image_file)
    })
}


async function loadImageFromFile(image_file_name) {
    let file_data = await loadAsDataURL(image_file_name)
    let image_data = await loadImageFromDataURL(file_data)
    return image_data
}

function getScaleParameters(image_data) {
    let newWidth = image_data.width;
    let newHeight = image_data.height;
    let scale = 1.0

    if (newWidth > config.MaxCanvasWidth) {
        scale = config.MaxCanvasWidth / image_data.width
        newWidth = config.MaxCanvasWidth
        newHeight = Math.round(image_data.height * scale)
    }
    return {
        'scale': scale,
        'width': newWidth,
        'height': newHeight
    }
}

async function drawImageAtCanvas(image_data, scaled_parameters) {
    let newWidth = scaled_parameters['width'];
    let newHeight = scaled_parameters['height'];

    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext('2d')
    ctx.drawImage(image_data, 0, 0, newWidth, newHeight)
    return;
}

export async function drawImageAtCanvasFromFile(image_file_name) {
    resetCanvas()
    const image_data = await loadImageFromFile(image_file_name)
    const scaled_parameters = getScaleParameters(image_data)

    await drawImageAtCanvas(image_data, scaled_parameters)
    return scaled_parameters['scale']
}