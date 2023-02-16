import * as config from "./config.js"
import * as proc from "./proc.js";
import * as mycanvas from "./mycanvas.js"

const image_file_input = document.getElementById('image-file-input')
const ocr_result_textarea = document.getElementById('ocr_result_textarea')
const ddMenu4ModelBtn = document.getElementById("ddMenu4ModelBtn");
const ddMenu4ModelList = document.getElementById("ddMenu4ModelList");
const ddMenu4LangBtn = document.getElementById('ddMenu4LangBtn');
const ddMenu4LangList = document.getElementById('ddMenu4LangList');
const ocr_submit = document.getElementById('ocr_submit');
const alert_success = document.getElementById('alert_success')
const alert_failed = document.getElementById('alert_failed')

function initialize_main(){
    // reset canvas
    mycanvas.resetCanvas()

    // add hide events
    proc.hideAllAlertDOMs(2000)

    if (!ocr_submit.hasAttribute('disable')){
        ocr_submit.disabled = true;
    }
}

async function getAvailableValues(api_url){
    const response = await fetch(api_url)
    const res_json = await response.json()
    const available_values = res_json.result
    return available_values
}

async function initializeLanguageSelection(model_name){
    // clear all language selaction
    while (ddMenu4LangList.firstChild) {
        ddMenu4LangList.removeChild(ddMenu4LangList.firstChild);
    }

    const url = `${config.URL_OCR_API_AvailableLanguages}/${model_name}`

    const language_names = await getAvailableValues(url)

    for (const language of language_names){
        const dditem = document.createElement('li')
        dditem.classList.add('dropdown-item')
        dditem.textContent = language
        dditem.addEventListener('click', function () {
            // click event for langage selection

            // if it is already `active` do nothing
            if (dditem.classList.contains('active')){
                return
            }
            
            ddMenu4LangList.childNodes.forEach(x => x.classList.remove('active'))
            dditem.classList.add('active')
            ddMenu4LangBtn.textContent = `Selected Language: ${language}`
        })
        ddMenu4LangList.appendChild(dditem)
    }

    // enable language selector
    ddMenu4LangBtn.removeAttribute('disabled')
}

async function initializeModelSelection(){
    // clear all model selaction
    while (ddMenu4ModelList.firstChild) {
        ddMenu4ModelList.firstChild.remove();
    }

    const model_names = await getAvailableValues(config.URL_OCR_API_AvailableModels)
    for (const model_name of model_names){
        const dditem = document.createElement('li')
        dditem.classList.add('dropdown-item')
        dditem.textContent = model_name
        
        dditem.addEventListener('click', function () {
            // click event for model selection

            // if it is already `active` do nothing
            if (dditem.classList.contains('active')) {
                return
            }
            initializeLanguageSelection(model_name)
            
            // clear all active atribute
            ddMenu4ModelList.childNodes.forEach(x => x.classList.remove('active'))
            dditem.classList.add('active')
            ddMenu4ModelBtn.textContent = `Selected Model: ${model_name}`
        })
        ddMenu4ModelList.appendChild(dditem)        
    }
}


// 検出矩形の構造フォーマットを変更
function shapeBoxes(api_boxes){
    let boxes = new Array()

    for (const api_box of api_boxes){
        const box_content = api_box['content']
        const box_position = api_box['position']
        const _x = box_position[0][0]
        const _y = box_position[0][1]
        const _w = box_position[1][0] - _x
        const _h = box_position[1][1] - _y

        boxes.push(Array.from([_x, _y, _w, _h, box_content]))
    }
    return boxes
}

async function handleOnLoadEvent(xhr){
    let alert_element = null

    const result_json = JSON.parse(xhr.responseText)
    if (xhr.status != 200) {
        // OCR failed
        alert_element = alert_failed
        alert(`api returned: status=${xhr.status}`)
    }else{
        // OCR scuceed
        alert_element = alert_success

        ocr_result_textarea.textContent = ''
        ocr_result_textarea.textContent = result_json["result"]["contents"]
        ocr_result_textarea.dispatchEvent(new Event('input'))

        // src画像の描画
        const input_file_name = image_file_input.files[0]
        const scale = await mycanvas.drawImageAtCanvasFromFile(input_file_name)
        const boxes = shapeBoxes(result_json["result"]["boxes"])
        mycanvas.setBoxes(boxes , scale)
    }

    alert_element.style.display = 'block'
    alert_element.dispatchEvent(new Event('show.alert'))
}

window.addEventListener('resize', function(){
    mycanvas.adjustBoxes()
})

window.onload = function () {
    initialize_main();
    initializeModelSelection()

    const ddMenu4BuilderBtn = document.getElementById('ddMenu4BuilderBtn');
    const ddMenu4BuilderList = document.getElementById('ddMenu4BuilderList');

    for (const x of ddMenu4BuilderList.children) {
        x.addEventListener('click', function () {
            // clear active
            for (const y of ddMenu4BuilderList.children) {
                y.classList.remove('active')
            }
            x.classList.add('active')
            ddMenu4BuilderBtn.textContent = `Selected Builder:${x.textContent}`
        })
    };
    
    image_file_input.addEventListener('change', function (ev) {
        if (ev.target.files.length == 0) {
            ocr_submit.disabled = true
            return
        }

        mycanvas.resetCanvas()
        
        mycanvas.drawImageAtCanvasFromFile(ev.target.files[0]).then(() =>
            ocr_submit.removeAttribute('disabled')
        )
    });

    ocr_result_textarea.addEventListener("input", function (event) {
        // adjust textarea height based on string length
        ocr_result_textarea.style.height = ""; // For a reliable reset, it is necessary
        ocr_result_textarea.style.height = `${ocr_result_textarea.scrollHeight}px`
    });
    
    const image_form = document.getElementById('image-upload-form')

   
    async function sendImagetoOCR(){
        const formData = new FormData(image_form)

        const activeModel = proc.getActiveDropdownItemText(ddMenu4ModelList)
        formData.append('model_name', activeModel)
        const activeLanguage = proc.getActiveDropdownItemText(ddMenu4LangList)
        formData.append('language', activeLanguage)
        const activeBuilder = proc.getActiveDropdownItemText(ddMenu4BuilderList)
        formData.append('builder', activeBuilder)

        const xhr = new XMLHttpRequest();

        xhr.open('POST', config.URL_OCR_API_OCR, true)
        xhr.onload = function(){
            handleOnLoadEvent(this, this.xhr)
        };

        xhr.send(formData)
    }

    image_form.addEventListener("submit", async function (event) {
        event.preventDefault();
        await sendImagetoOCR()
    });
}