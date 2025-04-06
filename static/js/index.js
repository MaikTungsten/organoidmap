/**
 * Function to initialize the html page
 */
async function initializePage() {


    const grouped_abbreviations = await fetch_abbreveations();

    const large_table = await fetch_large_table();

    
    //#region datatable
    
    //#endregion datatable



    
    //#region Abbreviations
    // get all Elements
    const abbr_cards_wrapper = document.getElementById("abbr-cards-wrapper");
    const filterbar_buttons = document.querySelectorAll("#abbr-filterbar button")
    const all_button = document.getElementById("all");
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
    all_button.classList.add("active"); // make the all button active initially
    all_button.click(); // initiate click event for all button
     
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