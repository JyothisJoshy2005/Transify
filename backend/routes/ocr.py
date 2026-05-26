"""
Flask Route: /api/ocr-translate
Handles image upload, OCR extraction, and translation
"""

import os
import uuid
import logging
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

from ocr.ocr_engine import extract_text_from_image
from translation.translator import translate_text, is_pair_supported
from database.db import save_translation

logger = logging.getLogger(__name__)
ocr_bp = Blueprint('ocr', __name__)

# Upload folder config
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp', 'tiff', 'webp'}


def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@ocr_bp.route('/ocr-translate', methods=['POST'])
def ocr_translate():
    """
    POST /api/ocr-translate
    Form data: image file + target_lang + ocr_lang
    Returns: { extracted_text, translated_text, accuracy, ocr_confidence }
    """
    try:
        # Validate file upload
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({
                'error': f'File type not allowed. Supported: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400

        # Get language parameters
        target_lang = request.form.get('target_lang', 'en').strip().lower()
        ocr_lang = request.form.get('ocr_lang', 'en').strip().lower()

        # Save uploaded file with unique name to avoid conflicts
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOAD_FOLDER, secure_filename(unique_filename))
        file.save(filepath)

        try:
            # Step 1: Extract text via OCR
            ocr_result = extract_text_from_image(filepath, hint_lang=ocr_lang)
            extracted_text = ocr_result['extracted_text']

            if not extracted_text:
                return jsonify({
                    'error': 'No text could be extracted from the image. '
                             'Please ensure the image contains clear, readable text.'
                }), 422

            # Step 2: Translate extracted text
            translation_result = None
            if ocr_lang != target_lang and is_pair_supported(ocr_lang, target_lang):
                translation_result = translate_text(extracted_text, ocr_lang, target_lang)
            elif ocr_lang != target_lang and is_pair_supported('en', target_lang):
                # Try through English pivot
                try:
                    step1 = translate_text(extracted_text, ocr_lang, 'en')
                    step2 = translate_text(step1['translated_text'], 'en', target_lang)
                    translation_result = {
                        'translated_text': step2['translated_text'],
                        'accuracy': round((step1['accuracy'] + step2['accuracy']) / 2, 1),
                        'source_lang': ocr_lang,
                        'target_lang': target_lang
                    }
                except Exception:
                    translation_result = {
                        'translated_text': extracted_text,
                        'accuracy': ocr_result['ocr_confidence'],
                        'source_lang': ocr_lang,
                        'target_lang': target_lang
                    }
            else:
                # Same language or unsupported pair - return original text
                translation_result = {
                    'translated_text': extracted_text,
                    'accuracy': ocr_result['ocr_confidence'],
                    'source_lang': ocr_lang,
                    'target_lang': target_lang
                }

            # Save to history
            try:
                save_translation(
                    input_text=extracted_text,
                    translated_text=translation_result['translated_text'],
                    source_lang=ocr_lang,
                    target_lang=target_lang,
                    accuracy=translation_result['accuracy'],
                    translation_type='ocr'
                )
            except Exception as e:
                logger.warning(f"Failed to save OCR history: {e}")

            return jsonify({
                'extracted_text': extracted_text,
                'translated_text': translation_result['translated_text'],
                'accuracy': translation_result['accuracy'],
                'ocr_confidence': ocr_result['ocr_confidence'],
                'word_count': ocr_result['word_count'],
                'source_lang': ocr_lang,
                'target_lang': target_lang
            }), 200

        finally:
            # Clean up uploaded file after processing
            if os.path.exists(filepath):
                os.remove(filepath)

    except RuntimeError as e:
        return jsonify({'error': str(e)}), 503
    except Exception as e:
        logger.error(f"OCR translation error: {e}", exc_info=True)
        return jsonify({'error': 'OCR processing failed', 'details': str(e)}), 500
