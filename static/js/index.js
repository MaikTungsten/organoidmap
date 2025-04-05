async function initializePage() {


    const abbreviations = await fetch_abbreveations();
    console.log(abbreviations)

    const large_table = await fetch_large_table();



}



initializePage()