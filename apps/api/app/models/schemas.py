from pydantic import BaseModel
from typing import Optional

class PredictTactileRequest(BaseModel):
    object_label: str
    image_base64: str
