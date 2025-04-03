from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import pandas as pd
import pickle
import numpy as np


# thereby, you get all db model classes and can directly connect the app to the database

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

    def __init__(self, abbreviation, description):

        self.abbreviation = abbreviation
        self.description = description

    def to_dict(self):

        return {
            'id': self.id,
            'abbreviation': self.abbreviation,
            'description': self.description
        }

        

# Create the database
with app.app_context():
    db.create_all()

def addLargeTable(excel_path):

    df = pd.read_excel(excel_path)

    for _, row in df.iterrows():
        
        entry = LargeTable(group=row['Group'], subgroup=row['Subgroup'], title=row['title'],
                           year=row['Year'], cell_origin=row['Cell origin'], doi=row['DOI'],
                           model=row['Model'], application=row['Application'], advantages=row['Advantages'],
                           limitations=row['Limitations'])
        db.session.add(entry)

    db.session.commit()

def addAbbreviations(excel_path):

    df = pd.read_excel(excel_path)

    for _, row in df.iterrows():
        
        entry = Abbreviations(abbreviation=row['Abbreviation'], description=row['Description'])
        db.session.add(entry)

    db.session.commit()