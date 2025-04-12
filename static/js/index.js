let active_field;
let table;


// Access the value of CSS variables
const inactive_color = getComputedStyle(document.documentElement).getPropertyValue('--inactive');
const text_color = getComputedStyle(document.documentElement).getPropertyValue('--text');
const subtext_color = getComputedStyle(document.documentElement).getPropertyValue('--subtext');

/**
 * Function to initialize the main html page
 */
async function initializeMainPage() {

    // fetch data 
    const grouped_abbreviations = await fetch_abbreveations();
    const large_table = await fetch_large_table();

    //#region Header
    const select_options = document.querySelector("#header-search .select-options");
    const select_textfield = document.querySelector("#header-search .select-text-field");
    const select = document.querySelector("#header-search .select");

    //  add options to select
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
    const models_unique = await fetch_unique_entries("model");
    const subgroups_unique = await fetch_unique_entries("subgroup");
    const focuses_unique = await fetch_unique_entries("focus");
    const journals_unique = await fetch_unique_entries("journal");

    // set number of papers
    papers_number_field.setAttribute("target", large_table.length );
    papers_number_field.innerText = Math.max(large_table.length - (Math.round(large_table.length*0.25)), 0);

    models_number_field.setAttribute("target", models_unique.length );
    models_number_field.innerText = Math.max(models_unique.length - (Math.round(models_unique.length*0.25)), 0);

    subgroups_number_field.setAttribute("target", subgroups_unique.length );
    subgroups_number_field.innerText = subgroups_unique.length - (Math.round(subgroups_unique.length*0.25));

    focuses_number_field.setAttribute("target", focuses_unique.length );
    focuses_number_field.innerText = Math.max(focuses_unique.length - (Math.round(focuses_unique.length*0.25)), 0);

    journals_number_field.setAttribute("target", journals_unique.length );
    journals_number_field.innerText = Math.max(journals_unique.length - (Math.round(journals_unique.length*0.25)), 0);


    animateStats();
    //#endregion Header

    
    //#region About
    const papers_span = document.getElementById("papers-span");

    papers_span.textContent = large_table.length;

    //#endregion About


    //#region Visualizations
    
    createVisualizations(large_table)
    //#endregionVisualizations


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
            // there are two possible ways the user clicks on a select, 
            // - either he clicks on this select while another is open => handle it
            // - or user clicks on select without another one opened

            
            // if some other dropdown is open -> close it first
            if (open_option && open_option !== options) {
                open_option.style.display = "none";
                open_option.previousElementSibling.classList.remove("open");

                // if select is closed, update checkboxes
                let filters = table.getFilters();

                if(filters){

                    //simplify tabulator filters
                    filters = simplifyFilters(filters);

                    updateCheckboxes(filters, large_table);
                }
            }

            // toggle current dropdown
            const isOpen = options.style.display === "flex";

            if (isOpen) {
                active_field = null;

                options.style.display = "none";
                select.classList.remove("open");
                open_option = null;

                // if select is closed, update checkboxes
                let filters = table.getFilters();

                if(filters){
                    //simplify tabulator filters
                    filters = simplifyFilters(filters);

                    updateCheckboxes(filters, large_table);
                    
                }

            } else {
                active_field = select.parentNode.id;

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
    const abbr_search_clear_button = document.querySelector("#abbr-search .clear-btn");

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
            abbr_search_clear_button.style.display = "flex";
        }else{
            abbr_search_clear_button.style.display = "none";
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

    // if the user clicks on the clear button, input field gets resetted, close button hidden and all cards are shown again
    abbr_search_clear_button.onclick = function() {
        
        abbr_search_input.value = ""; // reset input field
        abbr_search_clear_button.style.display = "none"; // hide close button


        // show all hidden cards again
        existing_cards = document.querySelectorAll("#abbr-cards-wrapper .abbr-card")

        existing_cards.forEach(card => {
            card.style.display = "flex";
        });
    };

    //#endregion Abbreviations


    //#region Footer

    // make logo in footer clickable
    const logo = document.querySelector("#organoid-map-logo > img")
    logo.onclick = function(){
        window.location.href="/"
    }
    //#endregion



}

/**
 * Function to initialize the legal page
 */
async function initializeLegalPage() { 
    
    const back_btn = document.getElementById("back-btn");

    // add function to the back button
    back_btn.onclick = function() {
        window.location.href = "/"
    }

    // make logo in footer clickable
    const logo = document.querySelector("#organoid-map-logo > img")
    logo.onclick = function(){
        window.location.href="/"
    }
}

// Depending on which page is active, run different initialize functions
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

//#region Functions for Visualization

/**
 * Function that creates all visualizations
 * @param {*} data 
 */
function createVisualizations(data){
    const group_container = document.getElementById("group-pie");
    const subgroup_container = document.getElementById("subgroup-pie");
    const focus_container = document.getElementById("focus-pie");
    const model_container = document.getElementById("model-pie");
    const cell_origin_container = document.getElementById("cell-origin-pie");

    const all_cont = [group_container, subgroup_container, focus_container, model_container, cell_origin_container];

    // initialize all charts 
    const [group_chart, subgroup_chart, focus_chart, model_chart, cell_origin_chart] = all_cont.map(cont => 
        echarts.init(cont)
    );

    // get pie data
    const group_data_init = returnPieData(getColumnValueFrequencies("group", data));
    const subgroup_data_init = returnPieData(getColumnValueFrequencies("subgroup", data));
    const focus_data_init = returnPieData(getColumnValueFrequencies("focus", data));
    const model_data_init = returnPieData(getColumnValueFrequencies("model", data));
    const cell_origin_data_init = returnPieData(getColumnValueFrequencies("cell_origin", data));

    // condense data based on a threshold in other category
    const threshold = 5; // (count)
    const group_data_init_condensed = condenseData(group_data_init,threshold);
    const subgroup_data_init_condensed = condenseData(subgroup_data_init,threshold);
    const focus_data_init_condensed = condenseData(focus_data_init,threshold);
    const model_data_init_condensed = condenseData(model_data_init,threshold);
    const cell_origin_data_init_condensed = condenseData(cell_origin_data_init,threshold);


    

    const categories = ["Group", "Subgroup", "Focus", "Model", "Cell Origin"];
    
    // helper maps, to look up the infor for each category
    const chart_map = {
        Group: group_chart,
        Subgroup: subgroup_chart,
        Focus: focus_chart,
        Model: model_chart,
        "Cell Origin": cell_origin_chart
    };

    const data_map_init_condensed = {
        Group: group_data_init_condensed,
        Subgroup: subgroup_data_init_condensed,
        Focus: focus_data_init_condensed,
        Model: model_data_init_condensed,
        "Cell Origin": cell_origin_data_init_condensed
    }

    const data_map_init= {
        Group: group_data_init,
        Subgroup: subgroup_data_init,
        Focus: focus_data_init,
        Model: model_data_init,
        "Cell Origin": cell_origin_data_init
    }

    const titles_map = {
        Group: "Groups",
        Subgroup: "Subgroups",
        Focus: "Focuses",
        Model: "Models",
        "Cell Origin": "Cell Origins"

    }

    const large_table_map = {
        Group: "group",
        Subgroup: "subgroup",
        Focus: "focus",
        Model: "model",
        "Cell Origin": "cell_origin"

    }

    
    // initialize each chart
    categories.forEach((category, index) =>{
        // alternate between blue_options and orange_options
        const options = returnChartOptions(index);

        // update chart
        updateChart(chart_map[category], data_map_init_condensed[category], options, titles_map[category], category);

        // for each category, handle if its chart is clicked
        handleChartClick(chart_map[category], chart_map, data_map_init, data_map_init_condensed, categories, titles_map, large_table_map, threshold, data)
    })
    
    

}


/**
 * Function sets onclick function to Echarts charts
 * @param {*} chart - Chart
 * @param {*} chart_map - Chart map to get the other charts
 * @param {*} data_map_init - Original data map
 * @param {*} data_map_init_condensed - Condensed data map
 * @param {string[]} categories - Array of categories
 * @param {Object} titles_map - Title map for each category
 * @param {Object} large_table_map - Large table map for each category
 * @param {int} threshold - Threshold for condensing the data
 * @param {*} large_table - Large Table Dataset 
 */
function handleChartClick(chart, chart_map, data_map_init, data_map_init_condensed, categories, titles_map,large_table_map,threshold, large_table){

    chart.on('click', function(params) {
        const chart_name = params.seriesName; // e.g. Model, Group
        const clicked_value = params.name;

        // get index of the chart category
        let current_idx = categories.indexOf(chart_name);

        // get chart button
        const reset_btn = chart._dom.previousElementSibling;

        // handle chart reset
        reset_btn.onclick = function(){

            // loop through categories to update charts
            categories.forEach((category, index) =>{

                // if index is greater or equal to the current index, update those charts (due to cascading updating behavior)
                if (index >= current_idx){

                    const options = returnChartOptions(index);

                    updateChart(chart_map[category], data_map_init_condensed[category], options, titles_map[category], category);
                }

            })

            // if reset is clicked, hide the button again
            reset_btn.classList.remove("visible");
            reset_btn.classList.add("hidden");

            // check if there are other visible reset buttons
            const other_visible_resets = document.querySelectorAll(".reset-selection-btn");

            // loop throught them and hide all, which are hierarchically lower (higher data-value than the current reset button)
            other_visible_resets.forEach(reset => {
                if (reset.getAttribute("data-value") > reset_btn.getAttribute("data-value")){
                    reset.classList.remove("visible");
                    reset.classList.add("hidden");
                }
            })


        }
        reset_btn.classList.add("visible"); // show reset button
        reset_btn.classList.remove("hidden");

        if(clicked_value !== "Other"){
            // filter the data
            const filtered_data = large_table.filter(row => row[large_table_map[chart_name]] === clicked_value);

            // loop through categories to retrieve new data and update charts
            categories.forEach((category, index) =>{

                // if index is greater or equal to the current indey, update those charts (due to cascading updating behavior)
                if (index >= current_idx){

                    const options = returnChartOptions(index);

                    const data = returnPieData(getColumnValueFrequencies(large_table_map[category], filtered_data));

                    updateChart(chart_map[category], data, options, titles_map[category], category);
                }
            })
        }else{
            const small_data = data_map_init[chart_name].filter(item => item.value < threshold); 
            const small_names = small_data.map(item => item.name);

            const updated_data = large_table.filter(row => small_names.includes(row[large_table_map[chart_name]]))
            
            let options = returnChartOptions(current_idx);
            updateChart(chart, small_data, options, titles_map[chart_name], chart_name);


            // loop through categories to retrieve new data and update charts
            categories.forEach((category, index) =>{

                // if index is greater or equal to the current indey, update those charts (due to cascading updating behavior)
                if (index > current_idx){
                    options = returnChartOptions(index);

                    const new_data = returnPieData(getColumnValueFrequencies(large_table_map[category],updated_data));

                    updateChart(chart_map[category], new_data, options, titles_map[category], category);
                }
            });

        

        }

    });


}

/**
 * Function that returns the chart options based on the index of the chart.
 * If the charts are below each other (flex-direction = column) blue -> orange -> blue -> orange -> blue
 * If its row, blue -> orange -> blue -> blue -> orange
 * @param {int} index - Index of the chart
 * @returns {Object} - Echarts options
 */
function returnChartOptions(index){

    const orange_options = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            type: 'scroll',  
            orient: 'vertical', 
            left: 'right',  
            top: 'middle',
            pageButtonItemGap:1, 
            pageButtonPosition: 'end', 
            padding: [0, 0, 0, 0],
            width: 70, 
            textStyle: {
                width: 100, 
                overflow: 'break', 
            },
            formatter: function (name) {
                const maxLength = 10;
                if (name.length > maxLength) {
                return name.slice(0, maxLength) + '-\n' + name.slice(maxLength);
                }
                return name;
            },
            data: []
        },
        series: [
            {
                name: 'Categories',
                type: 'pie',
                radius: ['0%', '57%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: 'center'
                },
                labelLine: {
                    show: false
                },
                data: [], 
                clockwise: false, 
                color: ["#d4632a", "#ffc07e", "#811d00", "#a76a6b",
                    "#e3a431",
                    "#d9374a",
                    "#e3ab62",
                    "#ac3f43",
                    "#e8b596",
                    "#b4411e",
                    "#6b4c33",
                    "#e66d32",
                    "#85644a",
                    "#db822a",
                    "#854a42",
                    "#a87629",
                    "#df8888",
                    "#7d5719",
                    "#ea705c",
                    "#6e4b22",
                    "#da9072",
                    "#6e4b22",
                    "#d68850",
                    "#896338",
                    "#b96153",
                    "#9c541c",
                    "#b08162",
                    "#925131"],
            }
        ]
    };

    const blue_options = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            type: 'scroll',  
            orient: 'vertical', 
            left: 'right',  
            top: 'middle',
            pageButtonItemGap:1, 
            pageButtonPosition: 'end', 
            padding: [0, 0, 0, 0],
            width: 70, 
            textStyle: {
                width: 100, 
                overflow: 'break', 
            },
            formatter: function (name) {
                const maxLength = 10;
                if (name.length > maxLength) {
                return name.slice(0, maxLength) + '-\n' + name.slice(maxLength);
                }
                return name;
            },
            data: []
        },
        series: [
            {
                name: 'Categories',
                type: 'pie',
                radius: ['0%', '57%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: 'center'
                },
                labelLine: {
                    show: false
                },
                data: [], 
                clockwise: false, 
                color: ["#103456", 
                    "#627da5", 
                    "#b5cffb", 
                    "#847fa6",
                    "#0f1f5f",
                    "#3b8187",
                    "#395bdd",
                    "#4b496c",
                    "#547cee",
                    "#292748",
                    "#5885de",
                    "#28a3a9",
                    "#162956",
                    "#4c93ac",
                    "#20296c",
                    "#245e78",
                    "#2c4bab",
                    "#3792bd",
                    "#19377e",
                    "#728abe",
                    "#1c4585",
                    "#5794d7",
                    "#2a4271",
                    "#767bc7",
                    "#445e8f",
                    "#494b93",
                    "#2e64a8",
                    "#2d5192"],
            
            }
        ]
    };

    let options;

    const viz_section = document.querySelector("section#visualizations #charts-wrapper");


    if (viz_section.style.flexDirection === "column"){
        options = index % 2 === 0 ? blue_options : orange_options;
    }else{
        options = (index % 5 === 1 || index % 5 === 4) ? orange_options : blue_options; 
    }

    return options;
}


/**
 * Function that updated the Chart data and options
 * @param {*} chart - Chart
 * @param {*} data - Data
 * @param {*} options - Echarts options
 * @param {string} title - Title of the chart
 * @param {string} chart_name - Chart Name / Category
 */
function updateChart(chart, data, options, title, chart_name) {

    options.series[0].data = data;

    options.title = {
        text: title,
        left: '30%', 
        top: 'top',  
        textAlign: 'center'
    };

    options.series[0].name = chart_name;

    options.series[0].center = ['30%', '50%'];


    options.legend.data = data.map(item => item.name);


    chart.setOption(options, true);
}


/**
 * Function to convert the data in the correct format for pie charts.
 * @param {{ [key: string]: number }} col_value_freq_data 
 * @returns {{ value: number, name: string }[]} 
 */
function returnPieData(col_value_freq_data){

    const data = [];

    Object.entries(col_value_freq_data).forEach(([name, value]) => {
        
        data.push({value: value, name: name})
    });

    // sort the data descending by value
    data.sort((a, b) => b.value - a.value);

    return data;
}

/**
 * Function condenses data by adding a other category in which all categories will be summed if their value is below a threshold.
 * @param {{{ value: number, name: string }[]}} data 
 * @param {int} threshold 
 */
function condenseData(data, threshold) {
    let condensed_data = [];
    let other_value = 0;
    let other = 'Other';


    // split data into large and small categories
    let large_data = data.filter(item => item.value >= threshold);
    let small_data = data.filter(item => item.value < threshold);

    // sum small categories and create "other" category
    small_data.forEach(item => {
        other_value += item.value;
    });

    if (other_value > 0) {
        condensed_data.push({ name: other, value: other_value });
    }

    // combine large categories and "other" 
    condensed_data = condensed_data.concat(large_data);

    // sort data again
    // sort the data descending by value
    condensed_data.sort((a, b) => b.value - a.value);

    return condensed_data;
}
//#endregion Functions for Visualization


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
    table = new Tabulator("#table-container", {
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

    // if table is loaded, initialize everything for each filter 
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

        //#region Initialize Header Searchbar
        
        // add function to the header search bar 
        const header_search_input = document.querySelector("#header-search input");
        const header_search_clear_btn = document.querySelector("#header-search .clear-btn");
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

                // show clear button
                const clear_filter_btn = document.getElementById("clear-filter-btn");
                clear_filter_btn.style.display = "flex";
            }

            
        }

        // handle if enter is clicked
        header_search_input.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                const value = event.target.value;
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
                            {field: "limitations", type: "like", value: value},
                            
                        ]]);
                    }else{
                        table.setFilter(field_value, "like", value);

                    }
                }

                // show clear button
                const clear_filter_btn = document.getElementById("clear-filter-btn");
                clear_filter_btn.style.display = "flex";
    
                
            }
        });

        // handle displaying of clear button based onif user is typing or not
        header_search_input.addEventListener("input", () => {
            if(header_search_input.value.length>0){
                header_search_clear_btn.style.display = "flex";
            }else{
                header_search_clear_btn.style.display = "none";
            }
        });

        // add function to clear button
        header_search_clear_btn.onclick = function() {
            header_search_input.value = '';
            header_search_clear_btn.style.display = 'none';
            header_search_input.focus();
        }

        //#endregion Initialize Header Searchbar


        // add functions to the clear filter button
        const clear_filter_btn = document.getElementById("clear-filter-btn");
        clear_filter_btn.onclick = function(){
            
            // clear all filter
            table.clearFilter();

            // uncheck all checkboxes
            document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => checkbox.checked = false);

            // remove all active-filter attributes
            document.querySelectorAll('.select.active-filter').forEach(select => select.classList.remove("active-filter"));

            // update checkboxes with no filter set
            updateCheckboxes({}, large_table)

            // hide clear filter
            clear_filter_btn.style.display = "none";

            // if search field has an input clear it
            if(header_search_input.value){

                // simulate header search click to remove input
                header_search_clear_btn.click();

                // prevent jumping back to search
                window.location.href = "#datatable"
            }
            
            
        };
    });

}

/**
 * Function converts tabulator filters to an simplified
 * @param {LargeTable[]} large_table - Array of LargeTable.
 */
function simplifyFilters(tabulatorFilters) {
    const result = {};

    // loop through tabulator filters
    tabulatorFilters.forEach(filter => {
      result[filter.field] = filter.value;
    });
    return result;
}

/**
 * Function that filters the given data based on the provided filters and gets the valid filter options and their frequencies.
 *
 * @param {Object} filters - An object where keys are column names and values are the filter criteria. 
 *                            Values can be a single value or an array of values.
 * @param {LargeTable[]} data - The dataset to be filterd.
 * @returns {{ [key: string | number]: number }} - An object where keys are column names and values are the frequency of each valid option.
 */
function getValidFilterOptionsAndFreqs(filters, data){

    const filtered_data = data.filter(row => {
        return Object.entries(filters).every(([key, value]) => {
          if (Array.isArray(value)) {
            return value.includes(row[key]);
          }
          return row[key] === value;
        });
    });

    const table_cols = ["group", "subgroup", "focus", "model", "cell_origin", "year", "journal"]

    const valid_options = Object.assign(
        {},
        ...table_cols.map(col => getColumnValueFrequencies(col, filtered_data))
    );

    return valid_options;
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

/**
 * Function that returns a dictionary of a value and its frequency inside a data column.
 * @param {string} table_col 
 * @param {*} data 
 * 
 * @returns {{ [key: string]: number }}
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
            
            } else {
                // if no checkboxes are selected, reset the filter
                table.clearFilter();
            }
            
        });

    });

    
}

/**
 * Function to update the Checkboxes depending on active filter
 * @param {*} filter 
 * @param {*} large_table
 */
function updateCheckboxes(filters, large_table){
    // get all valid options
    const valid_options = getValidFilterOptionsAndFreqs(filters, large_table);

    // get all checkboxes
    const checkboxes = document.querySelectorAll(".checkbox");

    // loop through checkboxes
    checkboxes.forEach(box => {
        const box_value = box.getAttribute("data-value");
        const box_span = box.querySelector("span");

        // if checkbox is a valid option
        if (box_value in valid_options){
            // show un-disable it and change its styling accordingly
            box.firstElementChild.disabled = false;
            box.lastElementChild.style.color = text_color;
            box.lastElementChild.lastElementChild.style.color = subtext_color;
            box_span.textContent = valid_options[box_value];
        } else{
            // if checkbox is not in valid options, disable it
            box.firstElementChild.disabled = true; 
            box.lastElementChild.style.color = inactive_color;
            box.lastElementChild.lastElementChild.style.color = inactive_color;
            box_span.textContent = "0"; // set count to 0
        }
    })

    const containers = document.querySelectorAll('.options-container');

    containers.forEach(container => {
        const boxes = Array.from(container.querySelectorAll('.checkbox'));

        // sort the checkbox divs based on the number in their .count span
        boxes.sort((a, b) => {
            const countA = parseInt(a.querySelector('.count').textContent);
            const countB = parseInt(b.querySelector('.count').textContent);
            return countB - countA; // Descending order
        });

        // re-append them in sorted order
        boxes.forEach(checkbox => container.appendChild(checkbox));
    })
}

/**
 * Function that adds or remove the active filter atribute of select elements depending on if any or no checkboxes are ticked, also it hides the clear filter button, if no filters are active
 * @param {HTMLElement} options_container 
 */
function colorSelectedFilter(options_container){
    const clear_filter_btn = document.getElementById("clear-filter-btn");

    options_container.addEventListener('change', (event) => {
        const target = event.target;
    
        if (target.matches('input[type="checkbox"]')) {

            const active_checkboxes = options_container.querySelectorAll('input[type="checkbox"]:checked');

            const values = Array.from(active_checkboxes).map(box => box.id);
    
            const select = options_container.parentNode.previousElementSibling;

            if(values.length > 0){
                select.classList.add("active-filter");
                clear_filter_btn.style.display = "flex"

            }else{
                select.classList.remove("active-filter");

                const active_selects = document.querySelectorAll(".select.active-filter");
                if(active_selects.length === 0){
                    clear_filter_btn.style.display = "none";
                }
            }
        }
    });
}



/**
 * Function activates the search element by adding an eventlistener.
 * @param {HTMLElement} options_container 
 * @param {HTMLElement} search - Input element
 */
function activateFilterSearch(options_container, search){

    const clear_btn = options_container.previousElementSibling.querySelector(".clear-btn");

    clear_btn.onclick = function(){
        search.value = ''; // reset input
        clear_btn.style.display = 'none'; // hide clear button
        search.focus(); // put input back in focus

        // show all checkboxes again
        const checkboxes = options_container.querySelectorAll("input");
        checkboxes.forEach(checkbox =>{
            checkbox.parentElement.style.display = "flex";
        });

    }

    search.addEventListener("input", (event) => {
        const input = event.target.value;

        if(input.length>0){
            clear_btn.style.display = "flex";
        }else{
            clear_btn.style.display = "none";
        }

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