/**
 * Function to initialize the html page
 */
async function initializePage() {


    const grouped_abbreviations = await fetch_abbreveations();

    const large_table = await fetch_large_table();

    //#region Header
    const header_search_input = document.querySelector("#header-search input");
    const header_search_btn = document.querySelector("#header-search #search-btn");
    const select_options = document.querySelector("#header-search .select-options");
    const select_textfield = document.querySelector("#header-search .select-text-field");
    const select = document.querySelector("#header-search .select");

    //  add options to select
    const table_columns = ["All_Fields"].concat(Object.keys(large_table[0])); // get all table columns for the field filter

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
            select_textfield.setAttribute("data-value", col);

            // set the active attribute to active option
            if(active_opt){
                active_opt.classList.remove("active");
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

    
    
    // handle search btn
    header_search_btn.onclick = function(){
        button_clicked = true;
        const value = header_search_input.value;
        console.log(value)
        
    }

    // handle if enter is clicked
    header_search_input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const value = event.target.value;
            console.log(value);
        }
    });


    const stats = document.querySelectorAll('.stats-number');

    const papers_number_field = Array.from(stats).find(el => el.id === 'papers-number');

    console.log(papers_number_field)

    papers_number_field.target = large_table.length;
    papers_number_field.innerText = 600;


    animateStats();






    //#endregion Header

    
    //#region Datatable
    createDataTable(large_table);
    //#endregion datatable



    
    //#region Abbreviations
    // get all Elements
    const abbr_cards_wrapper = document.getElementById("abbr-cards-wrapper");
    const filterbar_buttons = document.querySelectorAll("#abbr-filterbar button")
    const all_button = document.getElementById("all");
    const a_button = document.getElementById('a');
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
                    active_button.classList.remove('active');
                }

                // set all button as currently active
                active_button = button;
                button.classList.add("active");

                // retrieve array of all abbreviations
                const abbreviations = returnAbbreviationsByLetter(grouped_abbreviations, button.id);

                // reset cards wrapper 
                abbr_cards_wrapper.innerHTML='';
    
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
                        active_button.classList.remove('active');
                    }
    
                    // set button as currently active
                    active_button = button;
                    button.classList.add("active");
    
                    // retrieve array of abbreviations that start with the clicked letter
                    const abbreviations = returnAbbreviationsByLetter(grouped_abbreviations, button.id);
    
                    // reset cards wrapper 
                    abbr_cards_wrapper.innerHTML='';
    
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
    abbr_search_input.addEventListener('input', (event) =>{
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



initializePage()

//#region Function for Header
/**
 * Function that animates the stat counter
 */

function animateStats() {
    const stats = document.querySelectorAll('.stats-number');

    for(let stat of stats){
        const updateStats = function() {

            const target =+ stat.getAttribute('target');
            const count =+ stat.innerText;
            const speed = 1000000000000000;

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
        {title: "Title", field: "title", formatter: "textarea", width: 350},
        // {title: "Journal", field: "journal"},
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
    })

    // download table when button is clicked
    // const downloadButton = document.getElementById("download-table-button");
    // downloadButton.addEventListener('click', () => {
    //     table.download("csv", "data_overview.csv");
    // });
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