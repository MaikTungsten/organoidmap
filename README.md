# OrganoidMap

This repository contains code for OrganoidMap - a web application allowing to search a database containing results from a systematic literature search for brain organoid models. The **OrganoidMap** is available at: _Link will follow_

Please refer to the original publication (_Link will follow_) for further information.

## Backend

The backend is implemented with flask and flask_sqlalchemy (see ``app.py`` and ``init.py``). The backend hosts an SQLite database containing the main table of the literature results (about 800 entries) as well as a table containing all abbreviations used in the database entries. The database is available via ``/instance/db.sqlite3``.

## Frontend

The frontend is implemented with vanilla CSS, JavaScript and HTML (see ``static``and ``templates``) using the following component libraries: XXX.

## Contact

Questions or feedback regarding the web app? Please contact maik.wolfram-schauerte@uni-tuebingen.de, anna.wolfram@uni-tuebingen.de or lisa.sevenich@uni-tuebingen.de.

## Acknowledgement

This web app has been created by Caroline Trust, Dr. Maik Wolfram-Schauerte, Anna Wolfram and colleagues. The web app is hosted on the infrastructure of the Institute for Bioinformatics and Medical Informatics (IBMI) at Tübingen University.