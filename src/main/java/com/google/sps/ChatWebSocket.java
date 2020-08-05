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

import org.json.JSONObject;

@ServerEndpoint(value = "/chat/{chatroom}")
public class ChatWebSocket {

    private String chatRoom;
    private boolean isAuthenticated = false;
    private String uid;

    @OnOpen
    public void onOpen(Session session) throws IOException {
        // Get session and check if the user is authenticated with Firebase
        String chatRoom = session.getPathParameters()
                                 .get("chatroom");
        this.chatRoom = chatRoom;

        String idToken = session.getRequestParameterMap()
                                .get("idToken")
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
    public void textMessage(Session session, String msg) throws IOException {
        JSONObject messageJson = new JSONObject(msg);

        switch (messageJson.getString("type")) {
            case "MSG_SEND":
                chatMessage(session, messageJson);
                break;
            case "MAP_SEND":

                break;
            default:
                System.out.println("Invalid message");
        }
    }

    private void chatMessage(Session session, JSONObject messageData)
            throws IOException {
        System.out.println("Text message: " + messageData.getString("message"));

        List<Session> participants =
            WebSocketHandler.getInstance().getRoomList(chatRoom);

        JSONObject echoData = new JSONObject();
        echoData.put("type", "MSG_RECV");
        echoData.put("message", messageData.getString("message"));
        echoData.put("uid", uid);
        String echoJson = echoData.toString();

        for (Session participant : participants) {
            participant.getBasicRemote().sendText(echoJson);
        }
    }

    private void mapMessage(Session session, JSONObject messageData) {
        System.out.println("Map data: "
            + messageData.getString("lat")
            + messageData.getString("lng"));
    }

    @OnMessage
    public void binaryMessage(Session session, ByteBuffer msg) {
        System.out.println("Binary message: " + msg.toString());
    }
    @OnMessage
    public void pongMessage(Session session, PongMessage msg) {
        System.out.println("Pong message: " +
            msg.getApplicationData().toString());
    }

    @OnClose
    public void onClose(Session session) throws IOException {
        // WebSocket connection closes

        System.out.println("Socket " + session.getId() + " closed. " +
            "Was authenticated: " + isAuthenticated);

        if (!isAuthenticated) {
            return;
        }

        WebSocketHandler.getInstance().removeSession(chatRoom, session);
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        // Do error handling here
    }
}
