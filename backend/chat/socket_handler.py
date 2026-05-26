"""
Socket.IO Event Handlers for Real-Time Chat Translation
Each message sent by a user is translated to all other users' preferred languages
"""

import logging
from datetime import datetime
from flask_socketio import emit, join_room, leave_room

from translation.translator import translate_text, is_pair_supported, LANGUAGE_NAMES

logger = logging.getLogger(__name__)

# Track connected users: { socket_id: { name, language, room } }
connected_users = {}

CHAT_ROOM = 'global_chat'


def register_socket_events(socketio):
    """Register all SocketIO event handlers on the socketio instance."""

    @socketio.on('connect')
    def handle_connect():
        """Handle new client connection."""
        from flask import request as req
        sid = req.sid
        connected_users[sid] = {
            'name': f'User_{sid[:6]}',
            'language': 'en',
            'connected_at': datetime.utcnow().isoformat()
        }
        join_room(CHAT_ROOM, sid=sid)

        # Send current user count to all clients
        emit('user_count', {'count': len(connected_users)}, room=CHAT_ROOM)

        # Send existing user list to the new user
        emit('user_list', {
            'users': [
                {'sid': s, 'name': u['name'], 'language': u['language']}
                for s, u in connected_users.items()
            ]
        }, to=sid)

        logger.info(f"Client connected: {sid} | Total: {len(connected_users)}")

    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection."""
        from flask import request as req
        sid = req.sid
        user = connected_users.pop(sid, {})
        leave_room(CHAT_ROOM, sid=sid)

        # Notify remaining users
        emit('user_left', {
            'name': user.get('name', 'Someone'),
            'count': len(connected_users)
        }, room=CHAT_ROOM)

        emit('user_count', {'count': len(connected_users)}, room=CHAT_ROOM)
        logger.info(f"Client disconnected: {sid} | Total: {len(connected_users)}")

    @socketio.on('set_user_info')
    def handle_set_user_info(data):
        """
        Update user's display name and preferred language.
        data: { name, language }
        """
        from flask import request as req
        sid = req.sid
        if sid in connected_users:
            connected_users[sid]['name'] = data.get('name', connected_users[sid]['name'])[:30]
            connected_users[sid]['language'] = data.get('language', 'en')

        # Broadcast updated user list
        emit('user_list', {
            'users': [
                {'sid': s, 'name': u['name'], 'language': u['language']}
                for s, u in connected_users.items()
            ]
        }, room=CHAT_ROOM)

    @socketio.on('chat_message')
    def handle_chat_message(data):
        """
        Handle incoming chat message and broadcast translated versions.
        data: { text, source_lang }

        For each connected user, translate the message into their preferred language.
        """
        from flask import request as req
        sid = req.sid
        sender = connected_users.get(sid, {})
        sender_name = sender.get('name', 'Unknown')
        source_lang = data.get('source_lang', sender.get('language', 'en'))
        original_text = data.get('text', '').strip()

        if not original_text:
            return

        timestamp = datetime.utcnow().strftime('%H:%M')
        message_id = f"{sid}_{datetime.utcnow().timestamp()}"

        # Translate for each connected user
        for target_sid, target_user in connected_users.items():
            target_lang = target_user.get('language', 'en')

            # Translate if languages differ
            translated_text = original_text
            accuracy = 100.0
            is_translated = False

            if source_lang != target_lang:
                try:
                    if is_pair_supported(source_lang, target_lang):
                        result = translate_text(original_text, source_lang, target_lang)
                        translated_text = result['translated_text']
                        accuracy = result['accuracy']
                        is_translated = True
                    elif is_pair_supported('en', target_lang) and source_lang != 'en':
                        # Pivot through English
                        step1 = translate_text(original_text, source_lang, 'en')
                        step2 = translate_text(step1['translated_text'], 'en', target_lang)
                        translated_text = step2['translated_text']
                        accuracy = round((step1['accuracy'] + step2['accuracy']) / 2, 1)
                        is_translated = True
                except Exception as e:
                    logger.warning(f"Chat translation failed: {e}")
                    translated_text = original_text

            # Emit the (translated) message to this specific user
            socketio.emit('receive_message', {
                'id': message_id,
                'sender_sid': sid,
                'sender_name': sender_name,
                'original_text': original_text,
                'translated_text': translated_text,
                'source_lang': source_lang,
                'target_lang': target_lang,
                'source_lang_name': LANGUAGE_NAMES.get(source_lang, source_lang),
                'is_translated': is_translated,
                'accuracy': accuracy,
                'timestamp': timestamp,
                'is_own': target_sid == sid
            }, to=target_sid)

    @socketio.on('typing')
    def handle_typing(data):
        """Broadcast typing indicator to other users."""
        from flask import request as req
        sid = req.sid
        sender = connected_users.get(sid, {})
        emit('user_typing', {
            'name': sender.get('name', 'Someone'),
            'is_typing': data.get('is_typing', False)
        }, room=CHAT_ROOM, include_self=False)
