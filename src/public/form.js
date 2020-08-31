import { queryPhotos } from './api.js';

/**
 * Generate node for rendering input form for searching
 * @param {String} roverName name of rover
 * @returns {Node} Div element contains form
 */
const getHtmlInputForm = (roverName) => {
    let form = document.createElement("div");
    const btnID = `btn-${roverName}`;
    const formID = `form-${roverName}`;
    form.className = "searchboard";
    form.innerHTML = `
        <form id=${formID}>
            <fieldset>
                <legend>Search Photo:</legend>
                <div id="inputdiv">
                    <label for="camera">Camera:</label>
                    <select id="camera" name="camera">
                        <option value=""></option>
                        <option value="FHAZ">FHAZ</option>
                        <option value="RHAZ">RHAZ</option>
                        <option value="MAST">MAST</option>
                        <option value="CHEMCAM">CHEMCAM</option>
                        <option value="MAHLI">MAHLI</option>
                        <option value="MARDI">MARDI</option>
                        <option value="NAVCAM">NAVCAM</option>
                        <option value="PANCAM">PANCAM</option>
                        <option value="MINITES">MINITES</option>
                    </select><br>
                </div>
                <div class="inputdiv">
                    <label for="sol">Sol:</label>
                    <input type="text" id="sol" name="sol"><br>
                </div>
                <div class="inputdiv">
                    <label for="earthDate">Earth Date:</label>
                    <input type="date" id="earthDate" name="earthDate" value=""><br>
                </div>
                <div class="btn" id=${btnID}>Submit</div>
            </fieldset>
        </form>
    `;
    return form;
};

/**
 * Generate DOM Node for rendering message when api response returns nothing or exception
 * @param {String} message plain text to render
 * @returns {Node} Node object with warning message when returns nothing
 */
const resultPhotos = (message) => {
    const emptyNode = document.createElement("div");
    const emptyElement = document.createElement("p");
    const emptyMsg = document.createTextNode(message);
    emptyElement.appendChild(emptyMsg);
    emptyNode.appendChild(emptyElement);
    return emptyNode;
}

/**
 * Generate node for rendering search results div
 * @param {String} roverName name of rover
 * @returns {Node} Div element for showing photos as search result
 */
const getHtmlPhotos = (roverName) => {
    let photos = document.createElement("div");
    const resultID = `photos-${roverName}`;
    photos.innerHTML = `
        <p class="subtitle">Search Results:</p>
        <div class="photos" id=${resultID}></div>
    `;
    return photos;
};

/**
 * Remove searched photo elements
 * @param {String} roverName name of rover  
 */
const resetPhotos = (roverName) => {
    const photosID = `photos-${roverName}`;
    let grid = document.getElementById(photosID);
    while (grid.firstChild) {
        grid.removeChild(grid.lastChild);
    }
};

/**
 * submit event handler for input form
 * @param {Object} event triggered event
 */
const submitForm = async (event) => {
    const btnID = event.currentTarget.id;
    const roverName = btnID.slice(btnID.indexOf('-')+1);
    const photosID = `photos-${roverName}`;
    const formID = `form-${roverName}`;

    resetPhotos(roverName);
    let inputData = {roverName: roverName};
    const formData = document.getElementById(formID).elements;
    if (formData.earthDate.value) {
        Object.assign(inputData, {
            earthDate: formData.earthDate.value
        });
    }
    if (formData.sol.value) {
        Object.assign(inputData, {
            sol: formData.sol.value
        });
    }
    if (formData.camera.value) {
        Object.assign(inputData, {
            camera: formData.camera.value
        });
    }
    try {
        const photos = await queryPhotos(inputData);
        let grid = document.getElementById(photosID);
        if (photos.size) {
            photos.forEach(photo => {
                let gridItem = document.createElement("div");
                gridItem.className = "photo-item";
                let roverImg = new Image();
                roverImg.src = photo.get('src');
                let desc = document.createElement("div");
                let sol = document.createElement("p");
                sol.appendChild(document.createTextNode(`Sol: ${photo.get('sol')}`));
                let camera = document.createElement("p");
                camera.appendChild(document.createTextNode(`Camera: ${photo.get('camera')}`));
                let earthDate = document.createElement("p");
                earthDate.appendChild(document.createTextNode(`Earth Date: ${photo.get('earthDate')}`));
                desc.appendChild(sol);
                desc.appendChild(camera);
                desc.appendChild(earthDate);
                gridItem.appendChild(roverImg);
                gridItem.append(desc);
                grid.appendChild(gridItem);
            });
        } else {
            const emptyNode = resultPhotos("Sorry, looks like nothing has been found !");
            grid.appendChild(emptyNode);
        }
    } catch (error) {
        const errNode = resultPhotos(`API Error : ${error.message}`);
        grid.appendChild(errNode);
    }
};

export { getHtmlInputForm, getHtmlPhotos, submitForm };