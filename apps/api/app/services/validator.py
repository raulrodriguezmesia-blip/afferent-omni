import json
import os
from jsonschema import validate, ValidationError

SCHEMA_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "..",
        "..",
        "packages",
        "schema",
        "tactoforge.schema.json"
    )
)

def validate_against_schema(payload: dict):
    with open(SCHEMA_PATH, encoding='utf-8-sig') as f:
        schema = json.load(f)
    try:
        validate(instance=payload, schema=schema)
        return True
    except ValidationError as e:
        raise ValueError(e.message)