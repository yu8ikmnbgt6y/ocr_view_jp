
window.onload = function () {
    fetch("http://127.0.0.1:8080/available_models").then(response => {
        response.json().then(res => {
            let elem = document.getElementById("ddMenu4ModelList");
            res.result.forEach(model_name => {
                let appending = document.createElement('li')
                appending.classList.add('dropdown-item')
                appending.textContent = model_name
                appending.addEventListener('click', function () {
                    // appending.setAttribute('selected', '')
                    if (!appending.classList.contains('active')) {
                        // clear all active atribute
                        let siblings = document.querySelectorAll('#ddMenu4ModelList .dropdown-item')
                        siblings.forEach(x =>
                            x.classList.remove('active')
                        )
                        appending.classList.add('active')
                    }

                    // enable language selector
                    document.querySelector('#ddMenu4Lang').removeAttribute('disabled')
                    let ddmenu4langlist = document.getElementById('ddMenu4LangList')
                    while (ddmenu4langlist.firstChild) {
                        ddmenu4langlist.removeChild(ddmenu4langlist.firstChild);
                    }

                    fetch(`http://127.0.0.1:8080/available_language/${model_name}`).then(
                        x => x.json().then(
                            y => y.result.forEach(z => {
                                let appending_lang = document.createElement('li')
                                appending_lang.classList.add('dropdown-item')
                                appending_lang.textContent = z
                                appending_lang.addEventListener('click', function () {
                                    // appending_lang.setAttribute('selected', '')
                                    if (!appending_lang.classList.contains('active')) {
                                        ddmenu4langlist.childNodes.forEach(ddd => ddd.classList.remove('active'))
                                        appending_lang.classList.add('active')
                                    }
                                    document.getElementById('ddMenu4Lang').textContent = `Select Language: ${z}`
                                })
                                ddmenu4langlist.appendChild(appending_lang)
                            })
                        )
                    )
                    document.getElementById('ddMenu4Model').textContent = `Select Model: ${model_name}`
                })
                elem.appendChild(appending)
            }
            )
        }
        )
        // model_list.forEach(x => console.log(x));
    });

    let ddMenu4Bulderlist = document.querySelectorAll('#ddMenu4BulderList li')
    ddMenu4Bulderlist.forEach(x => {
        x.addEventListener('click', function () {
            // clear
            ddMenu4Bulderlist.forEach(builder_li =>
                builder_li.classList.remove('active')
            )
            x.classList.add('active')
            document.getElementById('ddMenu4Bulder').textContent = `Select Builder:${x.textContent}`
        })
    }
    )
}