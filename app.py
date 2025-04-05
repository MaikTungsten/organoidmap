# Import required packages

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from init import db
import pandas as pd

# Define app framework

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db.init_app(app)

# -- Navigation routes --

@app.route('/')
def index():
    return render_template("index.html")

# -- Database routes to fetch data -- 

# .. Route to fetch large table from database ..
@app.route("/fetch_large_table")
def fetch_large_table():
    try:
        entries = LargeTable.query.all()
        
        entries_dict = [row.to_dict() for row in entries]
    
        if not entries:
            return jsonify({"error": "No entries found"}), 404
        return jsonify(entries_dict), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# .. Route to fetch abbreviations from database ..
@app.route("/fetch_abbreviations")
def fetch_abbreviations():
    try:
        abbreviations = Abbreviations.query.order_by(Abbreviations.abbreviation).all()
        
        grouped_abbr = {}

        for abbreviation in abbreviations:
            key = abbreviation.abbreviation[0].lower()
            grouped_abbr.setdefault(key, []).append(abbreviation.to_dict())
    
        if not grouped_abbr:
            return jsonify({"error": "No entries found"}), 404
        
        return jsonify(grouped_abbr), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Define the LargeTable (main table) model class

class LargeTable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    group = db.Column(db.String, nullable=False)
    subgroup = db.Column(db.String, nullable=False)
    title = db.Column(db.String)
    year = db.Column(db.Integer, nullable=False)
    doi = db.Column(db.String)
    model = db.Column(db.String, nullable=False)
    cell_origin = db.Column(db.String, nullable=False)
    application = db.Column(db.String)
    advantages = db.Column(db.String)
    limitations = db.Column(db.String)

    # Initialization of a db entry
    def __init__(self, group, subgroup, title, year, doi, model, cell_origin, application, advantages, limitations):
        self.group = group
        self.subgroup = subgroup
        self.title = title
        self.year = year
        self.doi = doi
        self.model = model
        self.cell_origin = cell_origin
        self.application = application
        self.advantages = advantages
        self.limitations = limitations

    # Conversion to dictionary
    def to_dict(self):

        return {
            'id': self.id,
            'group': self.group,
            'subgroup': self.subgroup,
            'title': self.title,
            'year': self.year,
            'doi': self.doi,
            'model': self.model,
            'cell_origin': self.cell_origin,
            'application': self.application,
            'advantages': self.advantages,
            'limitations': self.limitations
        }

# Define the Abbreviations model
class Abbreviations(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    abbreviation = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(100), nullable=False)

    # Initialization of db entry
    def __init__(self, abbreviation, description):

        self.abbreviation = abbreviation
        self.description = description

    # Conversion to dictionary
    def to_dict(self):

        return {
            'id': self.id,
            'abbreviation': self.abbreviation,
            'description': self.description
        }      

# Create the database in app context

with app.app_context():
    db.create_all()

# Function for converting the abbreviations table to a database

def addLargeTable(excel_path):

    df = pd.read_excel(excel_path)

    for _, row in df.iterrows():
        
        entry = LargeTable(group=row['Group'], subgroup=row['Subgroup'], title=row['title'],
                           year=row['Year'], cell_origin=row['Cell origin'], doi=row['DOI'],
                           model=row['Model'], application=row['Application'], advantages=row['Advantages'],
                           limitations=row['Limitations'])
        db.session.add(entry)

    db.session.commit()

# Function for converting the abbreviations table to a database

def addAbbreviations(excel_path):

    df = pd.read_excel(excel_path)

    for _, row in df.iterrows():
        
        entry = Abbreviations(abbreviation=row['Abbreviation'], description=row['Description'])
        db.session.add(entry)

    db.session.commit()
    
    
if __name__ == "__main__":
    app.run(debug=True)