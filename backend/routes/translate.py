"""
Flask Route: /api/translate
Handles text translation requests using MarianMT
"""

import logging
from flask import Blueprint, request, jsonify
from langdetect import detect, LangDetectException

from translation.translator import (
    translate_text,
    get_supported_languages,
    is_pair_supported,
    LANGUAGE_NAMES
)
from database.db import save_translation

logger = logging.getLogger(__name__)
translate_bp = Blueprint('translate', __name__)


@translate_bp.route('/translate', methods=['POST'])
def translate():
    """
    POST /api/translate
    Body: { text, source_lang, target_lang, save_history }
    Returns: { translated_text, accuracy, source_lang, target_lang, model_used }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON body provided'}), 400

        text = data.get('text', '').strip()
        source_lang = data.get('source_lang', 'auto').strip().lower()
        target_lang = data.get('target_lang', 'en').strip().lower()
        save_to_history = data.get('save_history', True)

        if not text:
            return jsonify({'error': 'Text is required'}), 400

        if len(text) > 5000:
            return jsonify({'error': 'Text too long (max 5000 characters)'}), 400

        # Auto-detect source language if requested
        detected_lang = None
        if source_lang == 'auto':
            try:
                detected_lang = detect(text)
                source_lang = detected_lang
                logger.info(f"Auto-detected language: {detected_lang}")
            except LangDetectException:
                source_lang = 'en'
                detected_lang = 'en'

        # Validate language pair support
        if not is_pair_supported(source_lang, target_lang):
            # Try routing through English as pivot language
            if source_lang != 'en' and target_lang != 'en':
                # Two-step translation: src -> en -> tgt
                try:
                    step1 = translate_text(text, source_lang, 'en')
                    step2 = translate_text(step1['translated_text'], 'en', target_lang)
                    result = {
                        'translated_text': step2['translated_text'],
                        'accuracy': round((step1['accuracy'] + step2['accuracy']) / 2, 1),
                        'source_lang': source_lang,
                        'target_lang': target_lang,
                        'detected_lang': detected_lang,
                        'model_used': f"{step1['model_used']} + {step2['model_used']}",
                        'pivot': True
                    }
                except Exception:
                    return jsonify({
                        'error': f'Language pair {source_lang} → {target_lang} is not supported',
                        'supported_pairs': get_supported_languages()
                    }), 422
            else:
                return jsonify({
                    'error': f'Language pair {source_lang} → {target_lang} is not supported'
                }), 422
        else:
            result = translate_text(text, source_lang, target_lang)
            result['detected_lang'] = detected_lang
            result['pivot'] = False

        # Save to translation history
        if save_to_history:
            try:
                save_translation(
                    input_text=text,
                    translated_text=result['translated_text'],
                    source_lang=result['source_lang'],
                    target_lang=result['target_lang'],
                    accuracy=result['accuracy'],
                    translation_type='text'
                )
            except Exception as e:
                logger.warning(f"Failed to save history: {e}")

        return jsonify(result), 200

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Translation error: {e}", exc_info=True)
        return jsonify({'error': 'Translation failed', 'details': str(e)}), 500


@translate_bp.route('/languages', methods=['GET'])
def languages():
    """GET /api/languages - Returns list of supported languages."""
    langs = get_supported_languages()
    return jsonify({'languages': langs, 'count': len(langs)}), 200


@translate_bp.route('/detect', methods=['POST'])
def detect_language():
    """
    POST /api/detect
    Body: { text }
    Returns: { language, language_name, confidence }
    """
    try:
        data = request.get_json()
        text = data.get('text', '').strip()

        if not text:
            return jsonify({'error': 'Text is required'}), 400

        detected = detect(text)
        lang_name = LANGUAGE_NAMES.get(detected, detected.upper())

        return jsonify({
            'language': detected,
            'language_name': lang_name,
        }), 200

    except LangDetectException:
        return jsonify({'language': 'en', 'language_name': 'English'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
