"""
OCR Engine - Tesseract OCR Wrapper
Extracts text from uploaded images using pytesseract
"""

import os
import logging
import pytesseract
from PIL import Image, ImageFilter, ImageEnhance
import cv2
import numpy as np

logger = logging.getLogger(__name__)

# On Windows, Tesseract must be installed and path set
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

# Tesseract language codes mapping
TESSERACT_LANG_MAP = {
    'en': 'eng',
    'hi': 'hin',
    'ml': 'mal',
    'ta': 'tam',
    'kn': 'kan',
    'de': 'deu',
    'fr': 'fra',
    'es': 'spa',
    'ar': 'ara',
    'zh': 'chi_sim',
    'ru': 'rus',
    'it': 'ita',
    'pt': 'por',
    'ko': 'kor',
}


def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Preprocess image for better OCR accuracy:
    - Convert to grayscale
    - Enhance contrast
    - Apply sharpening filter
    - Denoise using OpenCV
    """
    # Convert PIL image to OpenCV format
    img_array = np.array(image.convert('RGB'))
    img_cv = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

    # Convert to grayscale
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)

    # Apply adaptive thresholding for better text detection
    thresh = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 11, 2
    )

    # Denoise
    denoised = cv2.fastNlMeansDenoising(thresh, h=10)

    # Convert back to PIL
    processed = Image.fromarray(denoised)

    # Enhance sharpness
    enhancer = ImageEnhance.Sharpness(processed)
    processed = enhancer.enhance(2.0)

    return processed


def extract_text_from_image(image_path: str, hint_lang: str = 'en') -> dict:
    """
    Extract text from an image file using Tesseract OCR.
    Returns extracted text and confidence score.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    # Load image
    original_image = Image.open(image_path)

    # Preprocess for better accuracy
    processed_image = preprocess_image(original_image)

    # Map hint language to Tesseract language code
    tess_lang = TESSERACT_LANG_MAP.get(hint_lang, 'eng')
    # Always include English as fallback
    if tess_lang != 'eng':
        tess_lang = f'{tess_lang}+eng'

    try:
        # Run OCR with detailed output
        ocr_data = pytesseract.image_to_data(
            processed_image,
            lang=tess_lang,
            output_type=pytesseract.Output.DICT,
            config='--psm 6 --oem 3'
        )

        # Extract text and calculate confidence
        words = []
        confidences = []
        for i, word in enumerate(ocr_data['text']):
            word = word.strip()
            conf = ocr_data['conf'][i]
            if word and conf > 0:
                words.append(word)
                confidences.append(conf)

        extracted_text = ' '.join(words).strip()

        # Calculate average confidence
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        accuracy = round(min(99.0, max(50.0, avg_confidence)), 1)

        if not extracted_text:
            # Fallback: simple OCR without preprocessing
            extracted_text = pytesseract.image_to_string(
                original_image,
                lang=tess_lang,
                config='--psm 3 --oem 3'
            ).strip()
            accuracy = 70.0

        return {
            'extracted_text': extracted_text,
            'ocr_confidence': accuracy,
            'word_count': len(words),
            'language_hint': hint_lang
        }

    except pytesseract.TesseractNotFoundError:
        raise RuntimeError(
            "Tesseract OCR is not installed or not found. "
            "Please install Tesseract from https://github.com/UB-Mannheim/tesseract/wiki"
        )
    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")
        raise


def get_supported_ocr_languages() -> list:
    """Return list of languages supported by OCR."""
    return [
        {'code': code, 'tess_code': tess}
        for code, tess in TESSERACT_LANG_MAP.items()
    ]
