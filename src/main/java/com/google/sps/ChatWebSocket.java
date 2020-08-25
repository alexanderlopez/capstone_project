package com.google.sps;

import java.io.IOException;
import java.util.ArrayList;
import java.nio.ByteBuffer;
import java.util.List;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.CloseReason;
import javax.websocket.PongMessage;
import javax.websocket.server.ServerEndpoint;

import com.google.cloud.datastore.Key;

import com.google.sps.WebSocketHandler;
import com.google.sps.CapstoneAuth;
import com.google.sps.DatastoreManager;

import org.json.JSONObject;

@ServerEndpoint(value = "/chat/{chatroom}")
public class ChatWebSocket {

    public static final String MESSAGE_SEND = "MSG_SEND";
    public static final String MESSAGE_RECEIVE = "MSG_RECV";
    public static final String MAP_SEND = "MAP_SEND";
    public static final String MAP_RECEIVE = "MAP_RECV";
    public static final String MAP_DELETE = "MAP_DEL";

    public static final String JSON_MESSAGE = "message";
    public static final String JSON_TITLE = "title";
    public static final String JSON_BODY = "body";
    public static final String JSON_LATITUDE = "lat";
    public static final String JSON_LONGITUDE = "lng";
    public static final String JSON_COLOR = "color";
    public static final String JSON_TYPE = "type";
    public static final String JSON_USER_ID = "uid";
    public static final String JSON_USER_NAME = "name";
    public static final String JSON_ID = "id";
    public static final String JSON_TIMESTAMP = "time";
    public static final String JSON_ROOM_NAME = "name";
    public static final String JSON_ROOM_ID = "roomId";
    public static final String JSON_ROOM_ARRAY = "rooms";
    public static final String JSON_EMAIL_ARRAY = "emails";
    public static final String JSON_THREAD = "thread";
    public static final String JSON_USER_EMAIL = "email";
    public static final String SOCKET_PARAMETER_ROOM = "chatroom";
    public static final String SOCKET_PARAMETER_ID = "idToken";

    private long chatRoomId;
    private boolean isAuthenticated = false;
    private String uid;

    /**
     * Method called every time that a websocket is opened. Initializes the
     * socket by adding it to the list of session associated to the chatroom.
     * Verifies if the user is authenticated, if this is not the case the
     * connection is closed.
     */
    @OnOpen
    public void onOpen(Session session) throws IOException {
        // Get session and check if the user is authenticated with Firebase
        String chatRoomId = session.getPathParameters()
                                 .get(SOCKET_PARAMETER_ROOM);
        this.chatRoomId = Long.parseLong(chatRoomId);

        String idToken = session.getRequestParameterMap()
                                .get(SOCKET_PARAMETER_ID)
                                .get(0);

        if (!CapstoneAuth.isUserAuthenticated(idToken)) {
            session.close(new CloseReason(
                CloseReason.CloseCodes.PROTOCOL_ERROR,
                 "User not authenticated."));
            isAuthenticated = false;

            return;
        }

        uid = CapstoneAuth.getUserId(idToken);

        if (!DatastoreManager.getInstance().isUserAllowedChatroom(uid,
                this.chatRoomId)) {
            session.close(new CloseReason(
                CloseReason.CloseCodes.PROTOCOL_ERROR,
                 "User not allowed to use this chat room."));
            isAuthenticated = false;

            return;
        }

        isAuthenticated = true;

        // If the user is authenticated then add the session to the chatroom.
        WebSocketHandler.getInstance().addSession(this.chatRoomId, session);
    }

    /**
     * Method called when the websocket receives string data from the client.
     * Parses the type of message received with types MSG_SEND, MAP_SEND,
     * MAP_DELETE, and processes them accordingly.
     */
    @OnMessage
    public void onTextMessage(Session session, String msg) throws IOException {
        JSONObject messageJson = new JSONObject(msg);

        switch (messageJson.getString(JSON_TYPE)) {
            case MESSAGE_SEND:
                handleChatMessage(session, messageJson);
                break;
            case MAP_SEND:
                handleMapMessage(session, messageJson);
                break;
            case MAP_DELETE:
                handleMapDelete(session, messageJson);
                break;
            default:
                throw new IllegalArgumentException("Invalid message type.");
        }
    }

    private void broadcastString(String broadcastMessage) throws IOException {
        List<Session> participants =
            WebSocketHandler.getInstance().getRoomList(chatRoomId);

        for (Session participant : participants) {
            participant.getBasicRemote().sendText(broadcastMessage);
        }
    }

    private void handleChatMessage(Session session, JSONObject messageData)
            throws IOException {
        JSONObject echoData = new JSONObject();
        echoData.put(JSON_TYPE, MESSAGE_RECEIVE);
        echoData.put(JSON_MESSAGE, messageData.getString(JSON_MESSAGE));
        echoData.put(JSON_USER_ID, uid);
        echoData.put(JSON_THREAD, messageData.getString(JSON_THREAD));

        new Thread(){
            public void run() {
                DatastoreManager.getInstance().addMessage(chatRoomId, echoData);
            }
        }.start();

        echoData.put(JSON_USER_NAME, DatastoreManager.getInstance()
            .getUserName(uid));

        broadcastString(echoData.toString());
    }

    private void handleMapDelete(Session session, JSONObject messageData)
            throws IOException {
        JSONObject echoData = new JSONObject(messageData,
            new String[]{JSON_ID});

        //Delete marker
        long markerId = messageData.getLong(JSON_ID);
        DatastoreManager.getInstance().deleteMarker(chatRoomId, markerId);

        //Broadcast deletion
        echoData.put(JSON_TYPE, MAP_DELETE);

        broadcastString(echoData.toString());
    }

    private void handleMapMessage(Session session, JSONObject messageData)
            throws IOException {
        JSONObject echoData = new JSONObject(
            messageData, new String[]{JSON_TITLE, JSON_BODY, JSON_LATITUDE,
                    JSON_LONGITUDE, JSON_COLOR});

        if (messageData.has(JSON_ID)) {
            echoData.put(JSON_ID, messageData.getLong(JSON_ID));

            new Thread(){
                public void run() {
                    DatastoreManager.getInstance()
                                    .updateMarker(chatRoomId, echoData);
                }
            }.start();
        }
        else {
            Key markerKey =
                DatastoreManager.getInstance().newMarkerKey(chatRoomId);

            new Thread(){
                public void run() {
                    DatastoreManager.getInstance()
                                    .addMarker(markerKey, echoData);
                }
            }.start();

            echoData.put(JSON_ID, markerKey.getId());
        }

        echoData.put(JSON_TYPE, MAP_RECEIVE);

        broadcastString(echoData.toString());
    }

    /**
     * Method called when the websocket connection with the client is closed.
     * If this is the case, and the user is authenticated, the socket endpoint
     * is removed from the list of sessions associated with the chatroom.
     */
    @OnClose
    public void onClose(Session session) throws IOException {
        if (!isAuthenticated) {
            return;
        }

        WebSocketHandler.getInstance().removeSession(chatRoomId, session);
    }
}
