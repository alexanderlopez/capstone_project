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
    public static final String JSON_TYPE = "type";
    public static final String JSON_USER_ID = "uid";
    public static final String JSON_ID = "id";

    public static final String SOCKET_PARAMETER_ROOM = "chatroom";
    public static final String SOCKET_PARAMETER_ID = "idToken";

    private String chatRoom;
    private boolean isAuthenticated = false;
    private String uid;

    @OnOpen
    public void onOpen(Session session) throws IOException {
        // Get session and check if the user is authenticated with Firebase
        String chatRoom = session.getPathParameters()
                                 .get(SOCKET_PARAMETER_ROOM);
        this.chatRoom = chatRoom;

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

        if (!CapstoneAuth.isUserChatroomAuthenticated(chatRoom, idToken)) {
            session.close(new CloseReason(
                CloseReason.CloseCodes.PROTOCOL_ERROR,
                 "User not allowed to use this chat room."));
            isAuthenticated = false;

            return;
        }

        isAuthenticated = true;

        // If the user is authenticated then add the session to the chatroom.
        WebSocketHandler.getInstance().addSession(chatRoom, session);
    }

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
            WebSocketHandler.getInstance().getRoomList(chatRoom);

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

        DatastoreManager.getInstance().addMessage(chatRoom, echoData);

        broadcastString(echoData.toString());
    }

    private void handleMapDelete(Session session, JSONObject messageData)
            throws IOException {
        JSONObject echoData = new JSONObject(messageData,
            new String[]{JSON_ID});

        //Delete marker
        long markerId = messageData.getLong(JSON_ID);
        DatastoreManager.getInstance().deleteMarker(chatRoom, markerId);

        //Broadcast deletion
        echoData.put(JSON_TYPE, MAP_DELETE);

        broadcastString(echoData.toString());
    }

    private void handleMapMessage(Session session, JSONObject messageData)
            throws IOException {
        JSONObject echoData = new JSONObject(
            messageData, new String[]{JSON_TITLE, JSON_BODY, JSON_LATITUDE,
                    JSON_LONGITUDE});

        if (messageData.has(JSON_ID)) {
            System.out.println("Has id: " + messageData.getLong(JSON_ID));
            echoData.put(JSON_ID, messageData.getLong(JSON_ID));
            DatastoreManager.getInstance().updateMarker(chatRoom, echoData);
        }
        else {
            long markerId =
                DatastoreManager.getInstance().addMarker(chatRoom, echoData);

            echoData.put(JSON_ID, markerId);
            System.out.println("No id: " + markerId);
        }

        echoData.put(JSON_TYPE, MAP_RECEIVE);

        broadcastString(echoData.toString());
    }

    @OnClose
    public void onClose(Session session) throws IOException {
        if (!isAuthenticated) {
            return;
        }

        WebSocketHandler.getInstance().removeSession(chatRoom, session);
    }
}
