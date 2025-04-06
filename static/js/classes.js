/*

    Herein, are  all Classes for javascript, that are used in the organoidmap, they are similar to the Models used in the SQL database

*/

// LargeTable (main table) model class
class LargeTable {
    /**
     * @param {number} id
     * @param {string} group 
     * @param {string} subgroup
     * @param {string} focus 
     * @param {string} title
     * @param {string} journal 
     * @param {number} year 
     * @param {string} doi 
     * @param {string} model
     * @param {string} cell_origin
     * @param {string} application
     * @param {string} advantages
     * @param {string} limitations

     */
    constructor(id, group, subgroup, focus, title, journal, year, doi, model, cell_origin, application, advantages, limitations){
        this.id = id;
        this.group = group;
        this.subgroup = subgroup;
        this.focus = focus;
        this.title = title;
        this.journal = journal;
        this.year = year;
        this.doi = doi;
        this.model = model;
        this.cell_origin = cell_origin;
        this.application = application;
        this.advantages = advantages;
        this.limitations = limitations;
    }
}

// Abbreviation model class
class Abbreviation{
    /**
     * @param {number} id
     * @param {string} abbreviation 
     * @param {string} description 
     */
    constructor(id, abbreviation, description){
        this.id = id;
        this.abbreviation = abbreviation;
        this.description = description;
    }
}