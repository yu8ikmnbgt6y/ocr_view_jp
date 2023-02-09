
window.onload = function () {
    fetch("http://127.0.0.1:8000/available_models")
        .then(response => {
            let elem = document.getElementById("ddMenu4ModelList");
            response.json().then(res => {
                res.result.forEach(model_name =>
                    {
                        let appending = document.createElement('li')
                        appending.textContent = model_name
                        elem.appendChild(appending)
                    }
                )
                }
            )
            // model_list.forEach(x => console.log(x));
        }
        );
}

