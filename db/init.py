# Import required packages

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import pandas as pd

# Define app framework

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

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