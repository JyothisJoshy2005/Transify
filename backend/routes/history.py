"""
Flask Route: /api/history
CRUD operations for translation history stored in MongoDB
NOTE: /history/clear MUST be declared before /history/<item_id> so Flask
      matches the static 'clear' segment before the dynamic one.
"""

import logging
from flask import Blueprint, request, jsonify
from database.db import get_history, delete_history_item, clear_all_history, get_history_stats

logger = logging.getLogger(__name__)
history_bp = Blueprint('history', __name__)


@history_bp.route('/history', methods=['GET'])
def get_translation_history():
    """
    GET /api/history?limit=50&skip=0
    Returns paginated translation history, newest first.
    """
    try:
        limit = min(int(request.args.get('limit', 50)), 100)
        skip = int(request.args.get('skip', 0))

        history = get_history(limit=limit, skip=skip)
        stats = get_history_stats()

        return jsonify({
            'history': history,
            'count': len(history),
            'total': stats['total'],
            'stats': stats
        }), 200

    except Exception as e:
        logger.error(f"History fetch error: {e}")
        return jsonify({'error': 'Failed to fetch history', 'details': str(e)}), 500


@history_bp.route('/history/clear', methods=['DELETE'])
def clear_history():
    """
    DELETE /api/history/clear
    Deletes all translation history records.
    Must be declared BEFORE /<item_id> route.
    """
    try:
        count = clear_all_history()
        return jsonify({
            'message': f'Cleared {count} history records successfully',
            'deleted_count': count
        }), 200

    except Exception as e:
        logger.error(f"History clear error: {e}")
        return jsonify({'error': 'Failed to clear history', 'details': str(e)}), 500


@history_bp.route('/history/<item_id>', methods=['DELETE'])
def delete_history(item_id: str):
    """
    DELETE /api/history/<item_id>
    Deletes a single history item by its ID.
    """
    try:
        if not item_id:
            return jsonify({'error': 'Item ID is required'}), 400

        success = delete_history_item(item_id)
        if success:
            return jsonify({'message': 'History item deleted successfully'}), 200
        else:
            return jsonify({'error': 'Item not found'}), 404

    except Exception as e:
        logger.error(f"History delete error: {e}")
        return jsonify({'error': 'Failed to delete history item', 'details': str(e)}), 500


@history_bp.route('/history/stats', methods=['GET'])
def history_stats():
    """GET /api/history/stats - Returns translation statistics."""
    try:
        stats = get_history_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
