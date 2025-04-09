/**
 * Function to initialize the html page
 */
async function initializeMainPage() {


    const grouped_abbreviations = await fetch_abbreveations();

    const large_table = await fetch_large_table();

    //#region Header
    const header_search_input = document.querySelector("#header-search input");
    const header_search_btn = document.querySelector("#header-search #search-btn");
    const select_options = document.querySelector("#header-search .select-options");
    const select_textfield = document.querySelector("#header-search .select-text-field");
    const select = document.querySelector("#header-search .select");

    //  add options to select
    // const table_columns = ["All_Fields"].concat(Object.keys(large_table[0])); // get all table columns for the field filter
    const table_columns = ["All_Fields", "Title", "Application", "Advantages", "Limitations"]

    let active_opt;

    // loop through the table columns and add options
    table_columns.forEach(col => {
        const option = document.createElement("div");
        option.id = col.replace(/\s+/g, "-");
        option.ariaLabel = col;
        option.classList.add("select-option");

        option.innerText = col.toLowerCase()
                              .split("_")
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                             .join(" ");

        select_options.appendChild(option);

        // add function to options
        option.onclick = function(){
            
            select_textfield.innerText = option.innerText;
            select_textfield.parentNode.setAttribute("data-value", col
                                                                    .split("_")
                                                                    .map(word => word.charAt(0).toLowerCase() + word.slice(1))
                                                                    .join(" "));

            // set the active attribute to active option
            if(active_opt){
                active_opt.classList.remove("active");
                option.classList.add("active");
                active_opt = option;
            }else{
                option.classList.add("active");
                active_opt = option;
            }

            select.click(); // simulate slect click to hide options
        };
    });

    // initialize all fields as the active option
    const all_fields_button = document.getElementById("All_Fields");
    all_fields_button.click();

    // add functions to the select field
    let open = false;
    select.onclick = function() {
        if (open){
            select_options.style.display = "none";
            open = false;
            select.classList.remove("open");
        }else{
            select_options.style.display = "flex";
            open = true;
            select.classList.add("open");
        }
    };


    // ---- stats 

    // get all stats number fields 
    const papers_number_field = document.getElementById("papers-number");
    const models_number_field = document.getElementById("models-number");
    const subgroups_number_field = document.getElementById("subgroups-number"); 
    const focuses_number_field = document.getElementById("focuses-number");
    const journals_number_field = document.getElementById("journals-number");

    // fetch numbers 
    const models = await fetch_unique_entries("model");
    const subgroups = await fetch_unique_entries("subgroup");
    const focuses = await fetch_unique_entries("focus");
    const journals = await fetch_unique_entries("journal");

    // set number of papers
    papers_number_field.setAttribute("target", large_table.length );
    papers_number_field.innerText = Math.max(large_table.length - (Math.round(large_table.length*0.25)), 0);

    models_number_field.setAttribute("target", models.length );
    models_number_field.innerText = Math.max(models.length - (Math.round(models.length*0.25)), 0);

    subgroups_number_field.setAttribute("target", subgroups.length );
    subgroups_number_field.innerText = subgroups.length - (Math.round(subgroups.length*0.25));

    focuses_number_field.setAttribute("target", focuses.length );
    focuses_number_field.innerText = Math.max(focuses.length - (Math.round(focuses.length*0.25)), 0);

    journals_number_field.setAttribute("target", journals.length );
    journals_number_field.innerText = Math.max(journals.length - (Math.round(journals.length*0.25)), 0);

    console.log(subgroups.length)




    animateStats();






    //#endregion Header

    
    //#region About
    const papers_span = document.getElementById("papers-span");

    papers_span.textContent = large_table.length;
    
    //#endregion About



    //#region Datatable

    // get all select elements
    const group_select = document.querySelector("#group-filter .select");
    const subgroup_select = document.querySelector("#subgroup-filter .select");
    const focus_select = document.querySelector("#focus-filter .select");
    const model_select = document.querySelector("#model-filter .select");
    const cell_origin_select = document.querySelector("#cell-origin-filter .select");
    const year_select = document.querySelector("#year-filter .select");
    const journal_select = document.querySelector("#journal-filter .select");

    const all_selects = [group_select,subgroup_select, focus_select,model_select, cell_origin_select, year_select, journal_select];

    // add functions to all select buttons (show/hide options on click)
    let open_option = null; // flag to track visible/opened options

    all_selects.forEach(select => {
        const options = select.nextElementSibling;

        select.onclick = function () {
            // if some other dropdown is open -> close it first
            if (open_option && open_option !== options) {
                open_option.style.display = "none";
                open_option.previousElementSibling.classList.remove("open");
            }

            // toggle current dropdown
            const isOpen = options.style.display === "flex";

            if (isOpen) {
                options.style.display = "none";
                select.classList.remove("open");
                open_option = null;
            } else {
                options.style.display = "flex";
                select.classList.add("open");
                open_option = options;
            }

            // eventlistener that closes opend options if a click happens anywhere else
            document.addEventListener("click", (e) => {
                if (open_option && !open_option.contains(e.target) && !open_option.previousElementSibling.contains(e.target)) {
                    open_option.style.display = "none";
                    open_option.previousElementSibling.classList.remove("open");
                    open_option = null;
                }
            });
        };
    });


    // create data table
    createDataTable(large_table);


    //#endregion datatable



    
    //#region Abbreviations
    // get all Elements
    const abbr_cards_wrapper = document.getElementById("abbr-cards-wrapper");
    const filterbar_buttons = document.querySelectorAll("#abbr-filterbar button")
    const all_button = document.getElementById("all");
    const a_button = document.getElementById("a");
    const abbr_search_input = document.querySelector("#abbr-search .search-wrapper input");
    const abbr_search_close_button = document.querySelector("#abbr-search .close-btn");

    let active_button;

    // loop through all buttons to set functions to them
    filterbar_buttons.forEach(button => {

        // all button
        if(button.id === "all"){

            // add on click function
            button.onclick = function() {
                // remove currently active button if one is active
                if(active_button){
                    active_button.classList.remove("active");
                }

                // set all button as currently active
                active_button = button;
                button.classList.add("active");

                // retrieve array of all abbreviations
                const abbreviations = returnAbbreviationsByLetter(grouped_abbreviations, button.id);

                // reset cards wrapper 
                abbr_cards_wrapper.innerHTML="";
    
                // create a card for each abbreviation and append to container
                if(abbreviations){
                    abbreviations.forEach(abbr => {
                        createAndAppendAbbreviationCard(abbr, abbr_cards_wrapper)
                    })
                }
                
            }

        }else{ // alphabet buttons

            if(!grouped_abbreviations[button.id]){
                button.disabled = true; // disable the button if no abbreviations for the letter exists
            }else{
                button.onclick = function() {
                    // remove currently active button if one is active
                    if(active_button){
                        active_button.classList.remove("active");
                    }
    
                    // set button as currently active
                    active_button = button;
                    button.classList.add("active");
    
                    // retrieve array of abbreviations that start with the clicked letter
                    const abbreviations = returnAbbreviationsByLetter(grouped_abbreviations, button.id);
    
                    // reset cards wrapper 
                    abbr_cards_wrapper.innerHTML="";
    
                    // create a card for each abbreviation and append to container
                    if(abbreviations){
                        abbreviations.forEach(abbr => {
                            createAndAppendAbbreviationCard(abbr, abbr_cards_wrapper)
                        })
                    }
                    
                }
            }
            

        }
        

    });

    // initialize abbreviation section
    a_button.classList.add("active"); // make the a button active initially
    a_button.click(); // initiate click event for a button
     
    // add function to the search field
    abbr_search_input.addEventListener("input", (event) =>{
        const input = event.target.value;

        if(input.length>0){
            abbr_search_close_button.style.display = "flex";
        }else{
            abbr_search_close_button.style.display = "none";
        }

        existing_cards = document.querySelectorAll("#abbr-cards-wrapper .abbr-card")

        existing_cards.forEach(card => {
            const id = card.id;
            if (!id.startsWith(input)){
                card.style.display = "none";
            }else{
                card.style.display = "flex";
            }
        });

    });

    // if the user clicks on the search field, all_button click is being simulated
    abbr_search_input.onclick = function() {
        if(active_button.id !== "all" ){
            all_button.click();
        };
    }

    // if the user clicks on the close button, input field gets resetted, close button hidden and all cards are shown again
    abbr_search_close_button.onclick = function() {
        
        abbr_search_input.value = ""; // reset input field
        abbr_search_close_button.style.display = "none"; // hide close button


        // show all hidden cards again
        existing_cards = document.querySelectorAll("#abbr-cards-wrapper .abbr-card")

        existing_cards.forEach(card => {
            card.style.display = "flex";
        });
    };



    //#endregion Abbreviations





}

async function initializeLegalPage() { 
    
    const back_btn = document.getElementById("back-btn");

    // add function to the back button
    back_btn.onclick = function() {
        window.location.href = "/"
    }
}

// depending on which page is active, run different initialize functions
if(window.location.pathname === "/"){
    initializeMainPage();
} else if (window.location.pathname === "/legal"){
    initializeLegalPage();

}


//#region Function for Header
/**
 * Function that animates the stat counter
 */

function animateStats() {
    const stats = document.querySelectorAll(".stats-number");

    for(let stat of stats){
        const updateStats = function() {

            const target =+ stat.getAttribute("target");
            const count =+ stat.innerText;
            const speed = 1000000000000;

            const inc = target / speed; 
            if (count < target){
                stat.innerText = Math.ceil(count + inc);
                setTimeout(updateStats, 1);
            } else {
                stat.innerText = target;
            }
        }
        updateStats();
    }
}
//#endregion Function for Header

//#region Functions for Section Datatable

/**
 * Function that creates the table for the dataset and allows filtering
 * @param {LargeTable[]} large_table - Array of LargeTable.
 */
function createDataTable(large_table){
   
    // create the columns for the table
    const tableCols = [
        {title: "Group", field: "group"},
        {title: "Subgroup", field: "subgroup"},
        {title: "Focus", field: "focus"},
        {title: "Title", field: "title", formatter: "textarea", width: 350},
        {title: "Journal", field: "journal"},
        {title: "Year", field: "year"},
        {title: "DOI", field: "doi", formatter:"link", width: 200},
        {title: "Model", field: "model"},
        {title: "Cell Origin", field: "cell_origin"},
        {title: "Application", field: "application", formatter: "textarea", width: 450},
        {title: "Advantages", field: "advantages", formatter: "textarea", width: 600},
        {title: "Limitations", field: "limitations", formatter: "textarea", width: 450}
    ];

    // create the tabulator table 
    var table = new Tabulator("#table-container", {
        data: large_table,
        columns: tableCols,
        placeholder: "Nothing available",

        // add pagination
        pagination:"local",
        paginationSize: 5,
        paginationSizeSelector:[5, 10, 25, 50, 100, 250],
        paginationCounter:"rows",  
    });

    // download table when button is clicked
    // const downloadButton = document.getElementById("download-table-button");
    // downloadButton.addEventListener("click", () => {
    //     table.download("csv", "data_overview.csv");
    // });

    // fill filter options // get all select elements
    const group_options_container = document.querySelector("#group-filter .filter-options .options-container");
    const subgroup_options_container = document.querySelector("#subgroup-filter .filter-options .options-container");
    const focus_options_container = document.querySelector("#focus-filter .filter-options .options-container");
    const model_options_container = document.querySelector("#model-filter .filter-options .options-container");
    const cell_origin_options_container = document.querySelector("#cell-origin-filter .filter-options .options-container");
    const year_options_container = document.querySelector("#year-filter .filter-options .options-container");
    const journal_options_container = document.querySelector("#journal-filter .filter-options .options-container");

    const group_search = document.querySelector("#group-search input");
    const subgroup_search = document.querySelector("#subgroup-search input");
    const focus_search = document.querySelector("#focus-search input");
    const model_search = document.querySelector("#model-search input");
    const cell_origin_search = document.querySelector("#cell-origin-search input");
    const year_search = document.querySelector("#year-search input");
    const journal_search = document.querySelector("#journal-search input");


    table.on("dataLoaded", function(data){

        // GROUP FILTER 
        fillOptionsContainer(group_options_container, "group", data);
        activateFilterSearch(group_options_container, group_search);
        activateCheckboxFilter(group_options_container, "group", table);
        colorSelectedFilter(group_options_container)

        // SUBGROUP FILTER 
        fillOptionsContainer(subgroup_options_container, "subgroup", data);
        activateFilterSearch(subgroup_options_container, subgroup_search);
        activateCheckboxFilter(subgroup_options_container, "subgroup", table);
        colorSelectedFilter(subgroup_options_container)

        // FOCUS FILTER 
        fillOptionsContainer(focus_options_container, "focus", data);
        activateFilterSearch(focus_options_container, focus_search);
        activateCheckboxFilter(focus_options_container, "focus", table);
        colorSelectedFilter(focus_options_container)

        // MODEL FILTER 
        fillOptionsContainer(model_options_container, "model", data);
        activateFilterSearch(model_options_container, model_search);
        activateCheckboxFilter(model_options_container, "model", table);
        colorSelectedFilter(model_options_container)

        // CELL ORIGIN FILTER 
        fillOptionsContainer(cell_origin_options_container, "cell_origin", data);
        activateFilterSearch(cell_origin_options_container, cell_origin_search);
        activateCheckboxFilter(cell_origin_options_container, "cell_origin", table);
        colorSelectedFilter(cell_origin_options_container)

        // YEAR FILTER 
        fillOptionsContainer(year_options_container, "year", data);
        activateFilterSearch(year_options_container, year_search);
        activateCheckboxFilter(year_options_container, "year", table);
        colorSelectedFilter(year_options_container)

        // JOURNAL FILTER 
        fillOptionsContainer(journal_options_container, "journal", data);
        activateFilterSearch(journal_options_container, journal_search);
        activateCheckboxFilter(journal_options_container, "journal", table);
        colorSelectedFilter(journal_options_container)
        
        // add function to the header search bar 
        const header_search_input = document.querySelector("#header-search input");
        const header_search_close = document.querySelector("#header-search .close-btn");
        const header_search_select = document.querySelector("#header-search .select");
        const header_search_btn = document.querySelector("#header-search #search-btn");

        // handle search btn
        header_search_btn.onclick = function(){
            button_clicked = true;
            const value = header_search_input.value;
            const field_value = header_search_select.getAttribute("data-value");

            // redirect to datatable section
            window.location.href = "#datatable";

            // get current filter
            const current_filter = table.getFilters();

            if(current_filter.length > 0)
                if(field_value === "all fields"){
                    table.addFilter([[{field: "title", type: "like", value: value}, 
                        {field: "application", type: "like", value: value},
                        {field: "advantages", type: "like", value: value},
                        {field: "limitations", type: "like", value: value}
                        
                    ]]);
                }else{
                    table.addFilter(field_value, "like", value);
                }
            else{
                if(field_value === "all fields"){
                    table.setFilter([[{field: "title", type: "like", value: value}, 
                        {field: "application", type: "like", value: value},
                        {field: "advantages", type: "like", value: value},
                        {field: "limitations", type: "like", value: value}
                        
                    ]]);
                }else{
                    table.setFilter(field_value, "like", value);
                }
            }

            
        }

        // handle if enter is clicked
        header_search_input.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                const value = event.target.value;
                const field_value = header_search_select.getAttribute("data-value");

                // redirect to datatable section
                window.location.href = "#datatable";
                console.log(value);

                // get current filter
                const current_filter = table.getFilters();

                if(current_filter.length > 0)
                    if(field_value === "all fields"){
                        table.addFilter([[{field: "title", type: "like", value: value}, 
                            {field: "application", type: "like", value: value},
                            {field: "advantages", type: "like", value: value},
                            {field: "limitations", type: "like", value: value}
                            
                        ]]);
                    }else{
                        table.addFilter(field_value, "like", value);
                    }
                else{
                    if(field_value === "all fields"){
                        table.setFilter([[{field: "title", type: "like", value: value}, 
                            {field: "application", type: "like", value: value},
                            {field: "advantages", type: "like", value: value},
                            {field: "limitations", type: "like", value: value}
                            
                        ]]);
                    }else{
                        table.setFilter(field_value, "like", value);
                    }
                }
    
                
            }
        });

        table.on("dataFiltered", function(filters, rows){
            
        })
    });

}

/**
 * Function that fills the filter options container.
 * @param {HTMLElement} container 
 * @param {string} table_col
 * @param {*} data
 */
function fillOptionsContainer(container, table_col, data){

    // get frequencies
    const freqs = getColumnValueFrequencies(table_col, data);

    // get unique values for column
    var unique_values = [...new Set(data.map(row => row[table_col]))];

    // combine unique values with their frequencies
    const combined = unique_values.map(value => ({
        value: value,
        frequency: freqs[value]
    }));
    
    // sort the combined data by frequency in descending order
    const combined_sorted = combined.sort((a, b) => b.frequency - a.frequency);
    

    // create checkbox for each value and add it to options container
    combined_sorted.forEach(entry =>{
        let value = entry.value;
        const freq = entry.frequency;

        if (Number.isInteger(value)){
            value = value.toString(); // important for years which are int 
        }

        const checkbox_el = `<div class="checkbox" data-value="${value}">
                                <input type="checkbox" name="${value.toLowerCase()}" id="${value.toLowerCase()}">
                                <label for="${value.toLowerCase()}">${value} <span class="count">${freq}</span></label>
                            </div>`;
        
        container.insertAdjacentHTML('beforeend', checkbox_el);                   
    });


}

function updateCheckboxes(container, table_col, new_data) {

    var unique_values = [...new Set(new_data.map(row => row[table_col]))];

    // Loop through each checkbox and enable/disable based on whether the value is in the visible data
    container.querySelectorAll('.checkbox').forEach(checkbox => {
        const value = checkbox.getAttribute("data-value");
        const checkboxInput = checkbox.querySelector("input[type='checkbox']");
        const label = checkbox.querySelector("label");

        // Enable checkbox if the value exists in the filtered data, otherwise disable it
        if (unique_values.includes(value)) {
            checkbox.disabled = false; // Enable the entire div
            checkboxInput.disabled = false; // Enable the checkbox input
        } else {
            checkbox.disabled = true; // Disable the entire div
            checkboxInput.disabled = true; // Disable the checkbox input
        }

        // get frequencies
        const freqs = getColumnValueFrequencies(table_col, new_data);

        // Optionally update the count of values in the label
        const countSpan = label.querySelector(".count");
        const count = freqs[value];
        countSpan.textContent = count; // Update the count in the label
    });
    
}

/**
 * Function that returns a dictionary of a value and its frequency inside a data column.
 * @param {string} table_col 
 * @param {*} data 
 * 
 * @returns {}
 */
function getColumnValueFrequencies(table_col, data) {
    const frequency = {};

    data.forEach(row => {
        var value = row[table_col];
        if (frequency[value]) {
            frequency[value] += 1;
        } else {
            frequency[value] = 1;
        }
    });

    return frequency;
}

let selected_filter = [];


/**
 * Function activates the checkboxes by adding an eventlistener.
 * @param {HTMLElement} options_container 
 * @param {*} table_col 
 * @param {*} table 
 */
function activateCheckboxFilter(options_container, table_col, table ){

    const checkboxes = options_container.childNodes;

    let values = [];

    checkboxes.forEach(box => {

        box.addEventListener('change', event => {
            
            const value = box.getAttribute("data-value");

            if (event.target.checked) {
                
                if (!selected_filter.includes(value)) {
                    // add filter if not included yet
                    values.push(value);
                    const existingFilter = selected_filter.find(filter => filter.field === table_col);

                    if (existingFilter) {
                        existingFilter.value = values;
                        existingFilter.type = "in";
                    }else{
                        selected_filter.push({"field": table_col,"type": "=", "value":value});
                    }
                    
                }
            } else {
                // remove the value from the selected values array if unchecked
                
                values = values.filter(item => !(item === value))
                if (values.length < 1){
                    selected_filter = selected_filter.filter(item => !(item.field === table_col));
                }else{
                    selected_filter = selected_filter.filter(item => !(item.field === table_col));
                    if(values.length > 1){
                        selected_filter.push({"field": table_col,"type": "in", "value":values});
                    }else{
                        selected_filter.push({"field": table_col,"type": "=", "value":values[0]});
                    }
                    
                }

                
            }

            // if there are selected values, set the filter for or selected checkboxes
            if (selected_filter.length > 0) {

                table.setFilter(selected_filter);
                // const select = options_container.parentNode.previousElementSibling;
                // select.classList.add("active-filter");

                // table.on("dataFiltered", function(filters, rows){
                //     console.log(filters)
            
            
                //     if(filters.length > 0){
                //         const data = rows.map(row => row.getData());

                //         const group_options_container = document.querySelector("#group-filter .filter-options .options-container");
                //         const subgroup_options_container = document.querySelector("#subgroup-filter .filter-options .options-container");
                //         const model_options_container = document.querySelector("#model-filter .filter-options .options-container");
                //         const cell_origin_options_container = document.querySelector("#cell-origin-filter .filter-options .options-container");
                //         const year_options_container = document.querySelector("#year-filter .filter-options .options-container");
                //         const journal_options_container = document.querySelector("#journal-filter .filter-options .options-container");
            
                //         updateCheckboxes(group_options_container, "group", data);
                //         updateCheckboxes(subgroup_options_container, "subgroup", data)
                //         updateCheckboxes(model_options_container, "model", data);
                //         updateCheckboxes(cell_origin_options_container, "cell_origin", data);
                //         updateCheckboxes(year_options_container, "year", data);
                //         updateCheckboxes(journal_options_container, "journal", data);
                        
                //     }
                // })

            } else {
                // if no checkboxes are selected, reset the filter
                table.clearFilter();
                // const select = options_container.parentNode.previousElementSibling;
                // select.classList.remove("active-filter");

            }
        });

    });

    
}

/**
 * Function that adds or remove the active filter atribute of select elements depending on if any or no checkboxes are ticked
 * @param {HTMLElement} options_container 
 */
function colorSelectedFilter(options_container){
    options_container.addEventListener('change', (event) => {
        const target = event.target;
    
        if (target.matches('input[type="checkbox"]')) {

            const active_checkboxes = options_container.querySelectorAll('input[type="checkbox"]:checked');

            const values = Array.from(active_checkboxes).map(box => box.id);
    
            const select = options_container.parentNode.previousElementSibling;

            if(values.length > 0){
                select.classList.add("active-filter");
            }else{
                select.classList.remove("active-filter");
            }
        }
    });
}

/**
 * Function activates the search element by adding an eventlistener.
 * @param {HTMLElement} options_container 
 * @param {HTMLElement} search
 */
function activateFilterSearch(options_container, search){

    search.addEventListener("input", (event) => {
        const input = event.target.value;
        const checkboxes = options_container.querySelectorAll("input");

        checkboxes.forEach(checkbox =>{
            const id = checkbox.id;
            if (!id.startsWith(input) && !id.includes(input)){
                checkbox.parentElement.style.display = "none";
            }else{
                checkbox.parentElement.style.display = "flex";
            }

        });
    });

}


//#endregion Functions for Section Datatable

//#region Functions for Section Abbreviation
/**
 * Function to return all Abbreviations that start with the given letter.
 * @param {*} grouped_abbreviations 
 * @param {string} letter 
 * @returns {<Abbreviation[]>} 
 */
function returnAbbreviationsByLetter(grouped_abbreviations,letter){
    if(letter === "all"){
        // flatten the grouped dict
        const abbreviations = Object.values(grouped_abbreviations).flat();

        return abbreviations //return all entries
    }else{
        return grouped_abbreviations[letter]; // return entries for specific letter
    }
}

/**
 * Function to create an abbreviation card.
 * @param {Abbreviation} abbreviation 
 * @param {HTMLElement} parent_container 
 */
function createAndAppendAbbreviationCard(abbreviation, parent_container){
    
    const card = document.createElement("div");
    card.classList.add("abbr-card");
    card.id = abbreviation.abbreviation.toLowerCase();

    card.innerHTML = `<div class="abbr-text">${abbreviation.abbreviation}</div>
                      <div class="abbr-description">${abbreviation.description}</div>`;

    parent_container.appendChild(card);
}

//#endregion Functions for Section Abbreviation