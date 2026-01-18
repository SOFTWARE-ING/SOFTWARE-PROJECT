import pytesseract
import fitz  # PyMuPDF
import io


pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"

from PIL import Image

class OCRService:
    def extract_text(self, path: str) -> str:
        if path.endswith(".pdf"):
            text_content = []
            try:
                with fitz.open(path) as doc:
                    for page in doc:
                        text = page.get_text()
                        
                        # 2. Extraction et OCR des images intégrées (diagrammes, figures)
                        images_text = ""
                        for img in page.get_images(full=True):
                            try:
                                xref = img[0]
                                base_image = doc.extract_image(xref)
                                image_bytes = base_image["image"]
                                image = Image.open(io.BytesIO(image_bytes))
                                images_text += "\n" + pytesseract.image_to_string(image)
                            except Exception:
                                continue

                        # 3. Fallback OCR si page entièrement scannée (peu de texte extrait)
                        if len(text.strip()) < 5 and len(images_text.strip()) < 5:
                            pix = page.get_pixmap()
                            image = Image.open(io.BytesIO(pix.tobytes("png")))
                            text = pytesseract.image_to_string(image)
                        
                        text_content.append(text + "\n" + images_text)
                return "\n".join(text_content)
            except Exception as e:
                print(f"[OCR ERROR] {e}")
                return ""

        else:
            image = Image.open(path)
            return pytesseract.image_to_string(image)