const max_canvas_width = 800;
const canvas = document.getElementById("ocr_canvas");
canvas.width = max_canvas_width;
canvas.height = 600;
const ocr_submit = document.getElementById('ocr_submit');

const ddMenu4ModelBtn = document.getElementById("ddMenu4ModelBtn");
const ddMenu4ModelList = document.getElementById("ddMenu4ModelList");
const ddmenu4langBtn = document.getElementById('ddMenu4LangBtn');
const ddmenu4langList = document.getElementById('ddMenu4LangList');
const ddMenu4BuilderBtn = document.getElementById('ddMenu4BuilderBtn');
const ddMenu4BuilderList = document.getElementById('ddMenu4BuilderList');

const image_file_input = document.getElementById('image-file-input')


function get_active_dditem(ddMenuList) {
    for (const x of ddMenuList.children) {
        if (x.classList.contains('active')) {
            return x.textContent;
        }
    }
    return '';
}

async function loadImage(src){
    let image = null
    let promise = new Promise(function(resolve){
        image = new Image()
        image.onload = function(){
            resolve()
        }
        image.src = src
    })
    await promise
    return image
}

async function loadAsDataURL(image_file){
    let file_data = null

    let promise = new Promise(function(resolve){
        file_data = new FileReader()
        file_data.onload = function(){
            resolve()
        }
        file_data.readAsDataURL(image_file)
    })
    await promise
    return file_data.result
}

async function loadImageFromFile(image_file){
    let file_data = await loadAsDataURL(image_file)
    let image = await loadImage(file_data)
    return image
}

async function drawImageAtCanvas(_canvas, image_file){
    const ctx = _canvas.getContext('2d')
    ctx.setTransform(1,0,0,1,0,0)
    ctx.clearRect(0,0,ctx.canvas.clientWidth, ctx.canvas.clientHeight)
    
    let scale = 1.0
    let image = await loadImageFromFile(image_file)

    if (image.width > max_canvas_width){
        scale = parseFloat(max_canvas_width) / parseFloat(image.width)
        ctx.scale(scale, scale)
    }else{
        _canvas.width = image.width
        _canvas.height = image.height
    }
    ctx.drawImage(image, 0, 0, image.width, image.height)
}


window.onload = function () {
    fetch("http://127.0.0.1:8080/available_models").then(response => {
        response.json().then(res => {
            res.result.forEach(model_name => {
                const appending = document.createElement('li')
                appending.classList.add('dropdown-item')
                appending.textContent = model_name
                appending.addEventListener('click', function () {
                    // appending.setAttribute('selected', '')
                    if (!appending.classList.contains('active')) {
                        // clear all active atribute
                        for (const x of ddMenu4ModelList.children) {
                            x.classList.remove('active')
                        }
                        appending.classList.add('active')
                    }

                    // enable language selector
                    ddMenu4LangBtn.removeAttribute('disabled')
                    while (ddmenu4langList.firstChild) {
                        ddmenu4langList.removeChild(ddmenu4langList.firstChild);
                    }

                    fetch(`http://127.0.0.1:8080/available_language/${model_name}`).then(
                        x => x.json().then(
                            y => y.result.forEach(z => {
                                const appending_lang = document.createElement('li')
                                appending_lang.classList.add('dropdown-item')
                                appending_lang.textContent = z
                                appending_lang.addEventListener('click', function () {
                                    // appending_lang.setAttribute('selected', '')
                                    if (!appending_lang.classList.contains('active')) {
                                        ddmenu4langList.childNodes.forEach(ddd => ddd.classList.remove('active'))
                                        appending_lang.classList.add('active')
                                    }
                                    ddMenu4LangBtn.textContent = `Select Language: ${z}`
                                })
                                ddmenu4langList.appendChild(appending_lang)
                            })
                        )
                    )
                    ddMenu4ModelBtn.textContent = `Select Model: ${model_name}`
                })
                ddMenu4ModelList.appendChild(appending)
            })
        })
    });

    for (const x of ddMenu4BuilderList.children) {
        x.addEventListener('click', function () {
            //console.log('click to clear active')
            // clear active
            for (const y of ddMenu4BuilderList.children) {
                y.classList.remove('active')
            }
            x.classList.add('active')
            ddMenu4BuilderBtn.textContent = `Select Builder:${x.textContent}`
        })
    };

    image_file_input.addEventListener('change', function (ev) {
        if (ev.target.files.length == 0){
            return
        }

        drawImageAtCanvas(canvas, ev.target.files[0]).then(() =>
            ocr_submit.removeAttribute('disabled')
        )
    });

    const image_form = document.getElementById('image-upload-form')
    const ocr_result_textarea = document.getElementById('ocr_result_textarea')

    ocr_result_textarea.addEventListener("input", function (event) {
        ocr_result_textarea.style.height = ""; // 一旦リセット
        ocr_result_textarea.style.height = `${ocr_result_textarea.scrollHeight}px`
    });

    image_form.addEventListener("submit", function (event) {
        const formData = new FormData(image_form)

        formData.append('model_name', get_active_dditem(ddMenu4ModelList))
        formData.append('language', get_active_dditem(ddmenu4langList))
        formData.append('builder', get_active_dditem(ddMenu4BuilderList))
        event.preventDefault();

        const xhr = new XMLHttpRequest();
        xhr.open('POST', "http://127.0.0.1:8080/ocr", true)
        xhr.onreadystatechange = function () {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                const result_json = JSON.parse(xhr.responseText)
                if (xhr.status == 200) {
                    // OCR成功のサイン
                    ocr_result_textarea.textContent = ''
                    ocr_result_textarea.textContent = result_json["result"]["contents"]
                    ocr_result_textarea.dispatchEvent(new Event('input'))

                    
                    //検出矩形の描画
                    drawImageAtCanvas(canvas, image_file_input.files[0]).then(() =>{
                        const boxes = result_json["result"]["boxes"]
                        const ctx = canvas.getContext('2d')
                        console.log(boxes)
                        if (canvas.getContext) {
                            for (const box of boxes) {
                                const box_content = box['content']
                                const box_position = box['posistion'] // fix typo
                                const _x = box_position[0][0]
                                const _y = box_position[0][1]
                                const _w = box_position[1][0] - _x
                                const _h = box_position[1][1] - _y
                                ctx.strokeRect(_x, _y, _w, _h)
                            }
                        }
                    })                    
                } else {
                    // OCR失敗のサイン
                    alert(`api returned: status=${xhr.status}`)
                    console.log(result_json)
                }
            }
        }
        xhr.send(formData)
    });
}