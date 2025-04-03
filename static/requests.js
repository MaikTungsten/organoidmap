/*
   This page contains all axios fetch requests for the data from the backend 
*/


// ---- FUNCTIONS ------------------------------------------------------

/**
 * Function to fetch info from db
 * @returns {} 
 */
async function fetch_info() {
    return axios
    .get( "/fetch_info" )
    .then( ( response ) => {
        return response.data;
    } )
    .catch( ( error ) => {
        console.log("Error fetching info: ", error);
    } )
    .finally( )
}
