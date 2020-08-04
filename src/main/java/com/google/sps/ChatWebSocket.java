package com.google.sps;

import java.io.IOException;
import java.util.ArrayList;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.CloseReason;

import javax.websocket.server.ServerEndpoint;

import com.google.sps.WebSocketHandler;
import com.google.sps.CapstoneAuth;

@ServerEndpoint(value = "/chat/{chatroom}")
public class ChatWebSocket {

    private String chatRoom;
    private boolean isAuthenticated = false;

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
    public void onMessage(String message, Session session) throws IOException {
        // Handle new messages
    }

    @OnClose
    public void onClose(Session session) throws IOException {
        // WebSocket connection closes
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
