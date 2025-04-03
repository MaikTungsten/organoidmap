async function initializePage() {
    const entries = await fetch_info();
    console.log(entries)
}



initializePage()