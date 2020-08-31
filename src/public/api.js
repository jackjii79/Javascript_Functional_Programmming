import { Map, fromJS, List } from 'immutable';
import { getDate } from './utility.js';

/**
 * Get image of the day and its description 
 * @returns {Map} metadata including image source and its description
 * @throws {Object} throws an error when response code is not ok or response promise occurs error
 */
const getImageOfTheDay = async function() {
    const apodJson = await fetch(`http://localhost:3000/apod/${getDate()}`)
        .then(res => {
            if (!res.ok) {
                throw { 
                    message: `HTTP ${res.status} Code` 
                };
            }
            return res.json();
        })
        .catch(error => {
            if (error.message) {
                throw {
                    message: `API Call encounters unexpected error: ${error.message}`
                };
            } else {
                throw {
                    message: `API Call encounters unexpected error: ${error}`
                };
            }
        });
    return fromJS(apodJson);
};

/**
 * Get Rover manifest data 
 * @param {String} roverName rover name
 * @returns {Map} rover manifest data
 * @throws {Object} throws an error when response code is not ok or response promise occurs error
 */
const getRoverInfo = async function(roverName) {
    const roverJson = await fetch(`http://localhost:3000/manifests/${ roverName.toLowerCase() }`)
        .then(res => {
            if (!res.ok) {
                throw {
                    message: `HTTP ${res.status} Code`
                };
            }
            return res.json();
        })
        .catch(error => {
            if (error.message) {
                throw {
                    message: `API Call encounters unexpected error: ${error.message}`
                };
            } else {
                throw {
                    message: `API Call encounters unexpected error: ${error}`
                };
            }
        });
    return Map({
        landing_date: roverJson.manifest.photo_manifest.landing_date,
        launch_date: roverJson.manifest.photo_manifest.launch_date,
        status: roverJson.manifest.photo_manifest.status,
        max_sol: roverJson.manifest.photo_manifest.max_sol,
        max_date: roverJson.manifest.photo_manifest.max_date,
        total_photos: roverJson.manifest.photo_manifest.total_photos
    });
};

/**
 * Get photos given camera/sol/earthDate to query
 * @param {Object} queryConditions contains camera/sol/earthDate query data
 * @returns {List} a list photos satisfy with queryConditions
 * @throws {Object} throws an error when response code is not ok or response promise occurs error 
 */
const queryPhotos = async function(queryConditions) {
    const queryString = Object.entries(queryConditions).map(element => {
            return `${element[0]}=${element[1]}`;
        })
        .reduce((accumulate, element, index, array) => {
            if (accumulate) {
                accumulate = accumulate.concat("&");
            }
            return accumulate.concat(element);
        }, "");
    
    const photosJson = await fetch(`http://localhost:3000/query?${queryString}`)
        .then(res => {
            if (!res.ok) {
                throw {
                    message: `HTTP ${res.status} Code`
                };
            }
            return res.json();
        })
        .catch(error => {
            if (error.message) {
                throw {
                    message: `API Call encounters unexpected error: ${error.message}`
                };
            } else {
                throw {
                    message: `API Call encounters unexpected error: ${error}`
                };
            }
        });
    if (photosJson.response.hasOwnProperty('photos')) {
        return fromJS(photosJson.response.photos.map(element => {
            return {
                sol: element.sol,
                camera: element.camera.full_name,
                src: element.img_src,
                earthDate: element.earth_date
            };
        }));
    } else {
        return List();
    }
};

export { getImageOfTheDay, getRoverInfo, queryPhotos };