import { fromJS, List } from 'immutable';
import curiosityImg from './assets/img/Curiosity.jpg';
import opportunityImg from './assets/img/Opportunity.jpg';
import spiritImg from './assets/img/Spirit.jpg';
import { getImageOfTheDay, getRoverInfo } from './api.js';
import { getHtmlInputForm, getHtmlPhotos, submitForm } from './form.js';

// rover manifest fields
const manifestFields = List([
    'landing_date',
    'launch_date',
    'status',
    'max_sol',
    'max_date',
    'total_photos'
]);

// rover meta data
const roverStore = fromJS({
    user: { name: "Guest" },
    rovers: [
        {
            name: 'Curiosity',
            image: curiosityImg,
            description: 'Curiosity is a car-sized rover designed to explore Gale Crater on Mars as part of NASA\'s Mars Science Laboratory mission.'
        },
        {
            name: 'Opportunity',
            image: opportunityImg,
            description: 'Opportunity, also known as MER-B or MER-1, and nicknamed "Oppy", is a robotic rover that was active on Mars from 2004 until the middle of 2018'
        },
        {
            name: 'Spirit',
            image: spiritImg,
            description: 'Spirit, also known as MER-A or MER-2, is a robotic rover on Mars, active from 2004 to 2010. It was one of two rovers of NASA\'s Mars Exploration Rover Mission'
        }
    ]
});

// Root node of html
const root = document.getElementById('root');

/**
 * Update html based on API response status
 * @param {Node} root root node of html 
 * @param {Map} roverStore metadata of rovers
 * @param {Function} apodVideo function to render video type content from Apod API
 * @param {Function} apodImg function to render image type content from Apod API
 * @param {Function} apodError function to render error content if exception occurs from API
 * @param {List} fields required named attributes for manifest info
 * @param {Function} manifestProcess name of manifest process function per attribute
 * @param {Function} manifestError name of manifest error process function per attribute
 */
const render = async (root, roverStore, apodVideo, apodImg, apodError, fields, manifestProcess, manifestError) => {
    const roversTabContent = await roversTab(roverStore, fields, manifestProcess, manifestError);
    const apodTabContent = await renderApod(apodVideo, apodImg, apodError);
    const appHTML = App(apodTabContent, roversTabContent, roverStore);
    Object.assign(root, {
        innerHTML: appHTML
    });
};

/**
 * Generate raw HTML string for error msg from api
 * @param {Object} state contains error message
 * @returns {String} raw HTML
 */
const errorHTML = state => {
    return `
        <div class="error">
            ${state.message}
        </div>
    `;
};

/**
 * Generate Node for error msg from api
 * @param {Object} state contains error message
 * @returns {Node} DOM node object with error message
 */
const errorNode = state => {
    const errNode = document.createElement("div");
    errNode.className = "error";
    errNode.appendChild(document.createTextNode(state.message));
    return errNode;
};

/**
 * Render tab for Apod
 * @param {Function} apodVideo function to render video type content from Apod API
 * @param {Function} apodImg function to render image type content from Apod API
 * @param {Function} apodError function to render error content if exception occurs from API
 * @returns {String} raw HTML string to display API response content  
 */
const renderApod = async (apodVideo, apodImg, apodError) => {
    let renderHTML = '';
    try {
        const apiResponse = await getImageOfTheDay();
        const renderResponse = contentImageOfTheDay(apodVideo, apodImg);
        renderHTML = renderResponse(apiResponse);
    } catch (error) {
        renderHTML = apodError(error);
    } finally {
        return (`<div class="layoutButton-content" id="Apod">
                    ${renderHTML}
                </div>
        `);
    }
};

/**
 * Render Apod video
 * @param {Map} state Apod API response data
 * @returns {String} raw HTML
 */
const renderVideoApod = state => {
    return (`
            <p class="subtitle">See today's featured video</p>
            <iframe width="100%" height="100%" src="${state.get('image').get('url')}"></iframe>
            <div class="desc">
                <p class="subtitle">${state.get('image').get('title')}</p>
                <p class="text">${state.get('image').get('explanation')}</p>
            </div>
    `);
};

/**
 * Render Apod image
 * @param {Map} state Apod API response data
 * @returns {String} raw HTML 
 */
const renderImageApod = state => {
    return (`
            <div class="apodContent">
                <a target="_blank" href="${state.get('image').get('url')}">
                    <img src="${state.get('image').get('url')}" height="50%" width="auto"/>
                </a>
            </div>
            <div class="apodContent">
                <p class="subtitle">${state.get('image').get('title')}</p>
                <p class="text">${state.get('image').get('explanation')}</p>
            </div>
    `);
};

/**
 * Higher order function to generate render Apod content function 
 * @param {Function} apodVideo function to render video type
 * @param {Function} apodImg function to render image type
 * @returns {Function} Render function 
 */
const contentImageOfTheDay = (apodVideo, apodImg) => {
    const _img = apodImg, _video = apodVideo;
    return state => {
        return state.get('media_type') === "video" || state.get('image').get('url').includes('youtube') ? _video(state) : _img(state);
    };
};

/**
 * Generate raw HTML for the main page
 * @param {String} apodTabContent raw HTML string to render apod tab content
 * @param {String} roversTabContent raw HTML string to render rovers tab content
 * @param {Map} roverStore metadata of rovers
 * @returns {String} raw HTML
 */
const App = (apodTabContent, roversTabContent, roverStore) => {
    // raw HTML for rendering three rover tabs
    return `
        <div class="header">
            <header>${Greeting(roverStore.get('user').get('name'))}</header>
        </div>
        <div class="layout">
            <div class="layouts">
                <div>
                    <button id="layoutButton-default" class="layoutButton">Apod</button>
                    <button class="layoutButton">Rovers</button>
                </div>
                ${apodTabContent}
                <div class="layoutButton-content" id="Rovers">
                    <h2 class="title">Rovers Dashboard</h2>
                    <p class="subtitle">Instruction</p>
                    <p class="text">Click the tab in below to show corresponding rover information with interactive search</p>
                    ${roversTabContent}
                </div>
            </div>
        <footer>OpenSource contributor</footer>
    `
}

/**
 * Generate Welcome header page
 * @param {String} name 
 * @returns {String} raw HTML
 */
const Greeting = name => {
    if (name) {
        return `
            Welcome, ${name}!
            Today is ${new Date().toString()}
        `;
    }

    return `
        Hello!
        Today is ${new Date().toString()}
    `;
}

/**
 * Generate error text when api response from manifest occurs error
 * @param {String} field name of manifest attribute
 * @returns {String} error text
 */
const manifestErrorInfo = (field) => {
    return `Sorry, can not find value of ${field} from manifest API`;
};

/**
 * Generate normal text from manifest api response for given field 
 * @param {String} field name of manifest attribute
 * @param {String} value value of corresponding attribute
 * @returns {String} value text
 */
const manifestProcessInfo = (field, value) => {
    return `${field} : ${value}`;
};

/**
 * Entry function for rendering manifest rover info
 * @param {List} fields required named attributes for manifest info
 * @returns {Function} manifest process function
 */
const manifestMain = (fields) => {
    const _fields = fields;
    /**
     * Generate mainifest render function
     * @param {Function} processFunc name of manifest process function per attribute
     * @param {Function} errorFunc name of manifest error process function per attribute
     * @returns {Function} manifest render function
     */
    return (processFunc, errorFunc) => {
        const _process = processFunc, _error = errorFunc;
        /**
         * Generate DOM Node Object for rendering manifest data
         * @param {String} roverName target rover name
         * @returns {Node} DOM Object contains manifest info for rendering
         */
        return async roverName => {
            const manifestDiv = document.createElement("div");
            manifestDiv.className = "manifest";
            try {
                const manifestMAP = await getRoverInfo(roverName);
                _fields.forEach(field => {
                    const attributeNode = document.createElement("p");
                    if (manifestMAP.get(field)) {
                        attributeNode.appendChild(document.createTextNode(_process(field, manifestMAP.get(field))));
                    } else {
                        attributeNode.appendChild(document.createTextNode(_error(field)));
                    }
                    manifestDiv.appendChild(attributeNode);
                });
            } catch (error) {
                manifestDiv.appendChild(errorNode(error));
            }
            return manifestDiv;
        };
    };
};

/**
 * Generate DOM Node object for rendering rover data tab content
 * @param {Map} roverStates all rovers metadata
 * @returns {Node} Object contains rover data 
 */
const roverContentDOM = roverStates => {
    const roverDiv = document.createElement("div");
    roverDiv.className = "tabs";
    roverStates.get('rovers').forEach(item => {
        const tabButton = document.createElement("button");
        const tabName = document.createTextNode(item.get('name'));
        if (!item.get('name').localeCompare('Curiosity')) {
            tabButton.id = 'tabButton-default';
        }
        tabButton.appendChild(tabName);
        tabButton.className = "tabButton";
        roverDiv.appendChild(tabButton);
    });
    return roverDiv;
};


/**
 * Generate raw HTML for rendering rover page including tab button and corresponding content
 * @param {Map} roverStates all rovers metadata
 * @param {List} fields required named attributes for manifest info
 * @param {Function} manifestProcess name of manifest process function per attribute
 * @param {Function} manifestError name of manifest error process function per attribute
 * @returns {String} raw HTML 
 */
const roversTab = async (roverStates, fields, manifestProcess, manifestError) => {
    const roverDiv = roverContentDOM(roverStates);

    const roverProcess = manifestMain(fields);
    const roverRender = roverProcess(manifestProcess, manifestError);

    const contents = await Promise.all(roverStates.get('rovers').map(async item => {
        let element = document.createElement("div");
        element.className = "tabButton-content";
        element.id = item.get('name');
        const domElements = await getRoverPageContent(item, roverRender);
        domElements.forEach(domElement => {
            element.appendChild(domElement);
        });
        return element;
    }));

    return roverDiv.outerHTML.concat(...contents.map(item => {
        return item.outerHTML;
    }));
};

/**
 * Generate a list of Node for rendering given rover tab content
 * @param {Map} rover rover meta data
 * @param {Function} roverRender rover manifest render function
 * @returns {List} generated list of nodes
 */
const getRoverPageContent = async (rover, roverRender) => {
    const roverName = rover.get('name');
    let result = List();
    const parentDiv = document.createElement("div");
    const roverDesc = document.createElement("p");
    roverDesc.appendChild(document.createTextNode(rover.get('description')));
    const roverImg = new Image();
    roverImg.src = rover.get('image');
    parentDiv.appendChild(roverDesc);
    parentDiv.appendChild(roverImg);
    parentDiv.className = "intro";

    const roverManifestNode = await roverRender(roverName);

    result = result.concat(
        parentDiv, 
        roverManifestNode,
        getHtmlInputForm(roverName),
        getHtmlPhotos(roverName)
    );
    return result;
};

/**
 * Add event listener for tab button click
 * @param {String} className tab buttons class name
 */
const updateButtonClick = (className) => {
    Array.prototype.forEach.call(document.getElementsByClassName(className), element => {
        element.addEventListener('click', () => {
            switchTab(element);
        });
    });
    document.getElementById(`${className}-default`).click();
};

/**
 * Switch tab content when click tab button
 * @param {Object} currentTarget event trigger
 */
const switchTab = currentTarget => {
    const buttonClassName = currentTarget.className.split(' ')[0];
    const contentClassName = `${buttonClassName}-content`;
    let tabcontents = document.getElementsByClassName(contentClassName);
    let tabs = document.getElementsByClassName(buttonClassName);
    tabcontents = Array.prototype.map.call(tabcontents, element => {
        element.style.display = "none";
        return element;
    });
    tabs = Array.prototype.map.call(tabs, element => {
        element.className = element.className.replace(" active", "");
        return element;
    });
    document.getElementById(currentTarget.textContent).style.display = "block";
    currentTarget.className = currentTarget.className.concat(" active");
};

/**
 * Add event listener for form submit button
 */
const updateSubmit = () => {
    Array.prototype.forEach.call(
        document.getElementsByClassName("btn"), 
        element => element.addEventListener('click', submitForm)
    );
};

/** 
 * listening for load event because page should load before any JS is called
 */
window.addEventListener('load', async () => {
    await render(
        root,
        roverStore, 
        renderVideoApod, 
        renderImageApod, 
        errorHTML,
        manifestFields,
        manifestProcessInfo,
        manifestErrorInfo
    );
    updateButtonClick('layoutButton');
    updateButtonClick('tabButton');
    updateSubmit();
});
