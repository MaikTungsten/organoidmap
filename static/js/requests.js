/*
   This page contains all axios fetch requests for the data from the backend 
*/


// ---- FUNCTIONS ------------------------------------------------------

/**
 * Function to fetch LargeTable from Database
 * @returns {Promise<LargeTable[]>} 
 */
async function fetch_large_table() {
    return axios
    .get( "/fetch_large_table" )
    .then( ( response ) => {

        const data = response.data;

        const entries = data.map(data => {
            return new LargeTable(
                data.id,
                data.group,
                data.subgroup,
                data.title,
                data.year,
                data.doi,
                data.model,
                data.cell_origin,
                data.application,
                data.advantages,
                data.limitations
            );
        });

        return entries;
    } )
    .catch( ( error ) => {
        console.log("Error LargeTable: ", error);
    } )
    .finally( )
}


/**
 * Function to fetch Abbreviation from Database
 * @returns {Promise<Abbreviation[]>} 
 */
async function fetch_abbreveations() {
    return axios
    .get( "/fetch_abbreviations" )
    .then( ( response ) => {

        const data = response.data;

        // loop through all keys in data (alphabet)
        Object.keys(data).forEach(letter => {
            
            // replace dict entry by abbreviation Class 
            data[letter] = data[letter].map(entry => {
              return new Abbreviation(entry.id, entry.abbreviation, entry.description);
            });
        });

        return data;
    } )
    .catch( ( error ) => {
        console.log("Error fetching Abbreviations: ", error);
    } )
    .finally( )
}