import pytesseract

pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"

from PIL import Image
import pdfplumber

class OCRService:
    def extract_text(self, path: str) -> str:
        if path.endswith(".pdf"):
            text = ""
            with pdfplumber.open(path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
            return text

        else:
            image = Image.open(path)
            return pytesseract.image_to_string(image)
